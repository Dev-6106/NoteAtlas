/**
 * entity-extraction.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracts entities and relationships from document text using structured
 * LLM output, then persists them to MongoDB for the knowledge graph.
 *
 * Designed to run after document ingestion — call `extractAndPersistEntities`
 * with the full document text, IDs, and the LLM instance.
 */

import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { Entity } from "@/app/models/entity.models";
import { Relationship } from "@/app/models/relationship.models";
import { withRetry } from "./pipelineUtils";
import { logger } from "@/lib/logger";

// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for structured LLM output
// ─────────────────────────────────────────────────────────────────────────────

const EntitySchema = z.object({
  name: z.string().describe("The canonical name of the entity"),
  type: z.enum(["person", "org", "concept", "event", "product", "location", "date", "other"]),
  description: z.string().describe("A concise 1-2 sentence description of this entity"),
  aliases: z.array(z.string()).describe("Alternative names or abbreviations for this entity"),
});

const RelationshipSchema = z.object({
  source: z.string().describe("The name of the source entity (must match an entity name exactly)"),
  target: z.string().describe("The name of the target entity (must match an entity name exactly)"),
  type: z.enum([
    "related_to", "part_of", "caused_by", "created_by", "works_at",
    "mentioned_with", "contradicts", "supports", "depends_on",
    "predecessor_of", "successor_of", "alternative_to", "other",
  ]),
  label: z.string().describe("A short human-readable label for this relationship, e.g. 'founded', 'competes with'"),
  strength: z.number().min(0).max(1).describe("Confidence score from 0 to 1"),
  evidence: z.string().describe("A brief quote or paraphrase from the source text supporting this relationship"),
});

const ExtractionResultSchema = z.object({
  entities: z.array(EntitySchema),
  relationships: z.array(RelationshipSchema),
});

type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Prompt
// ─────────────────────────────────────────────────────────────────────────────

const EXTRACTION_PROMPT = PromptTemplate.fromTemplate(`
You are an expert knowledge graph builder. Analyze the following document text and extract all meaningful entities and relationships.

RULES:
1. Extract between 5-30 entities depending on document complexity.
2. For each entity, determine its type: person, org, concept, event, product, location, date, or other.
3. Provide a concise description for each entity.
4. Include common aliases (abbreviations, alternative names).
5. Extract meaningful relationships between entities.
6. Each relationship must reference entities by their exact canonical name.
7. Assign a confidence strength (0-1) to each relationship.
8. Provide brief evidence from the text for each relationship.
9. Focus on the most important and interesting connections.
10. Avoid trivial or obvious relationships.
11. Generate relationship labels that are short and descriptive (2-4 words).

Document Text:
"""
{document_text}
"""

Extract all entities and relationships from this document as structured JSON.
`);

// ─────────────────────────────────────────────────────────────────────────────
// Core extraction function
// ─────────────────────────────────────────────────────────────────────────────

async function extractEntitiesFromText<T extends Runnable>(
  llm: T,
  documentText: string,
): Promise<ExtractionResult> {
  // Truncate very long documents to fit context window
  const maxChars = 30_000;
  const truncatedText = documentText.length > maxChars
    ? documentText.slice(0, maxChars) + "\n\n[... document truncated for extraction ...]"
    : documentText;

  const structuredLlm = (llm as any).withStructuredOutput(ExtractionResultSchema);
  const chain = EXTRACTION_PROMPT.pipe(structuredLlm);

  const result = await withRetry(() =>
    chain.invoke({ document_text: truncatedText })
  ) as ExtractionResult;

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistence — deduplicate and upsert entities + relationships
// ─────────────────────────────────────────────────────────────────────────────

export async function extractAndPersistEntities<T extends Runnable>(
  llm: T,
  documentText: string,
  noteId: string,
  userId: string,
  docId: string,
): Promise<{ entityCount: number; relationshipCount: number }> {
  try {
    logger.info(`[entity-extraction] Starting extraction for doc ${docId} in note ${noteId}`);

    const extraction = await extractEntitiesFromText(llm, documentText);

    if (!extraction?.entities?.length) {
      logger.info("[entity-extraction] No entities extracted");
      return { entityCount: 0, relationshipCount: 0 };
    }

    // ── Upsert entities (deduplicate by name within notebook) ──
    const entityIdMap = new Map<string, string>(); // name → MongoDB _id

    for (const entity of extraction.entities) {
      const normalizedName = entity.name.toLowerCase().trim();

      // Check if entity already exists in this notebook
      const existing = await Entity.findOne({
        noteId,
        userId,
        $or: [
          { name: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") } },
          { aliases: { $regex: new RegExp(`^${escapeRegex(normalizedName)}$`, "i") } },
        ],
      });

      if (existing) {
        // Update: add this doc to sourceDocIds, increment mention count, merge aliases
        const newAliases = entity.aliases.filter(
          (a) => !existing.aliases.some(
            (ea: string) => ea.toLowerCase() === a.toLowerCase()
          )
        );

        await Entity.updateOne(
          { _id: existing._id },
          {
            $addToSet: { sourceDocIds: docId, aliases: { $each: newAliases } },
            $inc: { mentionCount: 1 },
            $set: {
              // Update description if new one is longer/better
              ...(entity.description.length > (existing.description?.length || 0)
                ? { description: entity.description }
                : {}),
            },
          },
        );

        entityIdMap.set(entity.name, existing._id.toString());
      } else {
        // Create new entity
        const newEntity = await Entity.create({
          name: entity.name,
          type: entity.type,
          description: entity.description,
          aliases: entity.aliases,
          noteId,
          userId,
          sourceDocIds: [docId],
          mentionCount: 1,
        });

        entityIdMap.set(entity.name, newEntity._id.toString());
      }
    }

    // ── Create relationships ──
    let relationshipCount = 0;

    for (const rel of extraction.relationships) {
      const sourceId = entityIdMap.get(rel.source);
      const targetId = entityIdMap.get(rel.target);

      if (!sourceId || !targetId) {
        logger.warn(
          `[entity-extraction] Skipping relationship: ${rel.source} → ${rel.target} (entity not found)`,
        );
        continue;
      }

      // Check if relationship already exists
      const existing = await Relationship.findOne({
        sourceEntity: sourceId,
        targetEntity: targetId,
        noteId,
        type: rel.type,
      });

      if (!existing) {
        await Relationship.create({
          sourceEntity: sourceId,
          targetEntity: targetId,
          type: rel.type,
          label: rel.label,
          strength: rel.strength,
          evidence: rel.evidence,
          sourceDocId: docId,
          noteId,
          userId,
        });
        relationshipCount++;
      } else {
        // Update strength if new evidence is stronger
        if (rel.strength > (existing.strength || 0)) {
          await Relationship.updateOne(
            { _id: existing._id },
            { $set: { strength: rel.strength, evidence: rel.evidence } },
          );
        }
      }
    }

    logger.info(
      `[entity-extraction] Extracted ${extraction.entities.length} entities, ${relationshipCount} relationships for doc ${docId}`,
    );

    return {
      entityCount: extraction.entities.length,
      relationshipCount,
    };
  } catch (error) {
    logger.error("[entity-extraction] Extraction failed", error);
    // Don't throw — entity extraction is non-critical and shouldn't block document ingestion
    return { entityCount: 0, relationshipCount: 0 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
