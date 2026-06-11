/**
 * knowledgeGraph.controller.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP controllers for the Knowledge Graph feature.
 * Provides endpoints to fetch the full graph, entity details, and trigger
 * entity extraction.
 */

import { Request, Response } from "express";
import { Entity } from "@/app/models/entity.models";
import { Relationship } from "@/app/models/relationship.models";
import { Doc } from "@/app/models/doc.models";
import { extractAndPersistEntities } from "@/pipelines/entity-extraction";
import { LLM } from "@/app/llm/llm";
import { logger } from "@/lib/logger";
import { updateOrCreateSummary } from "@/app/http/controllers/notes/summary/updateOrCreateSummary";
import { DocRepository } from "@/app/http/controllers/notes/repository/DocRepository";

/**
 * GET /api/v1/notes/:noteId/graph
 * Returns the full entity-relationship graph for a notebook.
 */
export async function getKnowledgeGraph(req: Request, res: Response) {
  try {
    const { noteId } = req.params;
    const userId = (req as any).userId;

    const [entities, relationships, docs] = await Promise.all([
      Entity.find({ noteId, userId }).lean(),
      Relationship.find({ noteId, userId })
        .populate("sourceEntity", "name type")
        .populate("targetEntity", "name type")
        .lean(),
      Doc.find({ noteId, userId }).select("_id title displayName").lean(),
    ]);

    // Transform into a format optimized for force-directed graph rendering
    const nodes = entities.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      type: e.type,
      description: e.description,
      aliases: e.aliases,
      mentionCount: e.mentionCount,
      sourceDocIds: e.sourceDocIds?.map((id: any) => id.toString()),
    }));

    const links = relationships.map((r) => ({
      id: r._id.toString(),
      source: (r.sourceEntity as any)?._id?.toString?.() || r.sourceEntity?.toString(),
      target: (r.targetEntity as any)?._id?.toString?.() || r.targetEntity?.toString(),
      type: r.type,
      label: r.label,
      strength: r.strength,
      evidence: r.evidence,
    }));

    const sourceDocs = docs.map((d) => ({
      id: d._id.toString(),
      title: d.displayName || d.title,
    }));

    res.json({ nodes, links, sourceDocs });
  } catch (error) {
    logger.error("[knowledge-graph] Error fetching graph", error);
    res.status(500).json({ error: { message: "Failed to fetch knowledge graph" } });
  }
}

/**
 * GET /api/v1/notes/:noteId/graph/entity/:entityId
 * Returns detailed info about a single entity and all its connections.
 */
export async function getEntityDetail(req: Request, res: Response) {
  try {
    const { noteId, entityId } = req.params;
    const userId = (req as any).userId;

    const entity = await Entity.findOne({ _id: entityId, noteId, userId }).lean();
    if (!entity) {
      res.status(404).json({ error: { message: "Entity not found" } });
      return;
    }

    // Fetch all relationships involving this entity
    const relationships = await Relationship.find({
      noteId,
      userId,
      $or: [{ sourceEntity: entityId }, { targetEntity: entityId }],
    })
      .populate("sourceEntity", "name type")
      .populate("targetEntity", "name type")
      .populate("sourceDocId", "title displayName summary studyGuide briefingDoc")
      .lean();

    // Fetch source documents that mention this entity
    const sourceDocs = entity.sourceDocIds?.length
      ? await Doc.find({ _id: { $in: entity.sourceDocIds } })
          .select("title displayName fileName")
          .lean()
      : [];

    // Get connected entity IDs for neighbor highlighting
    const connectedEntityIds = new Set<string>();
    relationships.forEach((r) => {
      const srcId = (r.sourceEntity as any)?._id?.toString?.();
      const tgtId = (r.targetEntity as any)?._id?.toString?.();
      if (srcId && srcId !== entityId) connectedEntityIds.add(srcId);
      if (tgtId && tgtId !== entityId) connectedEntityIds.add(tgtId);
    });

    res.json({
      entity: {
        id: entity._id.toString(),
        name: entity.name,
        type: entity.type,
        description: entity.description,
        aliases: entity.aliases,
        mentionCount: entity.mentionCount,
        firstSeen: entity.firstSeen,
      },
      relationships: relationships.map((r) => ({
        id: r._id.toString(),
        source: { id: (r.sourceEntity as any)?._id?.toString(), name: (r.sourceEntity as any)?.name },
        target: { id: (r.targetEntity as any)?._id?.toString(), name: (r.targetEntity as any)?.name },
        type: r.type,
        label: r.label,
        strength: r.strength,
        evidence: r.evidence,
        sourceDoc: r.sourceDocId ? {
          id: (r.sourceDocId as any)._id?.toString(),
          title: (r.sourceDocId as any).displayName || (r.sourceDocId as any).title,
          content: (r.sourceDocId as any).studyGuide || (r.sourceDocId as any).summary || (r.sourceDocId as any).briefingDoc || "",
        } : null,
      })),
      sourceDocs: sourceDocs.map((d) => ({
        id: d._id.toString(),
        title: d.displayName || d.title,
      })),
      connectedEntityIds: Array.from(connectedEntityIds),
    });
  } catch (error) {
    logger.error("[knowledge-graph] Error fetching entity detail", error);
    res.status(500).json({ error: { message: "Failed to fetch entity details" } });
  }
}

/**
 * POST /api/v1/notes/:noteId/graph/generate
 * Triggers entity extraction for all documents in a notebook that haven't
 * been processed yet, or re-processes all if `force: true`.
 */
export async function generateKnowledgeGraph(req: Request, res: Response) {
  try {
    const { noteId } = req.params;
    const userId = (req as any).userId;
    const { force } = req.body;

    // Find all docs in this notebook
    const docs = await Doc.find({ noteId, userId, status: "indexed" }).lean();

    if (!docs.length) {
      res.status(400).json({ error: { message: "No indexed documents found in this notebook" } });
      return;
    }

    // If force, clear existing entities and relationships
    if (force) {
      await Promise.all([
        Entity.deleteMany({ noteId, userId }),
        Relationship.deleteMany({ noteId, userId }),
      ]);
    }

    // Determine which docs need processing
    const existingEntityDocIds = force
      ? new Set<string>()
      : new Set(
          (await Entity.distinct("sourceDocIds", { noteId, userId }))
            .map((id: any) => id.toString()),
        );

    const docsToProcess = force
      ? docs
      : docs.filter((d) => !existingEntityDocIds.has(d._id.toString()));

    if (!docsToProcess.length) {
      res.json({ message: "Knowledge graph is up to date", entityCount: 0, relationshipCount: 0 });
      return;
    }

    // Respond immediately and process in background
    res.json({
      message: `Processing ${docsToProcess.length} document(s) for knowledge graph extraction`,
      docsToProcess: docsToProcess.length,
      status: "processing",
    });

    // Run extraction in background
    const llm = LLM.getInstance();
    let totalEntities = 0;
    let totalRelationships = 0;

    for (const doc of docsToProcess) {
      let docText = doc.studyGuide || doc.summary || doc.briefingDoc || "";
      if (!docText) {
        logger.warn(`[knowledge-graph] No text content found for doc ${doc._id}, generating summary first`);
        try {
          await updateOrCreateSummary(doc._id.toString(), userId, noteId);
          // Reload doc to get the newly generated summary
          const updatedDoc = await DocRepository.getInstance().getSingleDoc2({_id: doc._id.toString(), userId, noteId});
          docText = updatedDoc?.summary || "";
        } catch (e) {
          logger.error(`[knowledge-graph] Failed to generate summary for doc ${doc._id}: `, e);
        }
      }

      if (!docText) {
        logger.warn(`[knowledge-graph] Still no text content found for doc ${doc._id} after generation attempt, skipping`);
        continue;
      }

      const result = await extractAndPersistEntities(
        llm,
        docText,
        noteId,
        userId,
        doc._id.toString(),
      );
      totalEntities += result.entityCount;
      totalRelationships += result.relationshipCount;
    }

    logger.info(
      `[knowledge-graph] Completed: ${totalEntities} entities, ${totalRelationships} relationships across ${docsToProcess.length} docs`,
    );
  } catch (error) {
    logger.error("[knowledge-graph] Error generating graph", error);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: "Failed to generate knowledge graph" } });
    }
  }
}

/**
 * GET /api/v1/notes/:noteId/graph/stats
 * Returns quick stats about the knowledge graph for this notebook.
 */
export async function getGraphStats(req: Request, res: Response) {
  try {
    const { noteId } = req.params;
    const userId = (req as any).userId;

    const [entityCount, relationshipCount, typeCounts] = await Promise.all([
      Entity.countDocuments({ noteId, userId }),
      Relationship.countDocuments({ noteId, userId }),
      Entity.aggregate([
        { $match: { noteId: new (require("mongoose").Types.ObjectId)(noteId), userId: new (require("mongoose").Types.ObjectId)(userId) } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      entityCount,
      relationshipCount,
      typeCounts: Object.fromEntries(typeCounts.map((t: any) => [t._id, t.count])),
    });
  } catch (error) {
    logger.error("[knowledge-graph] Error fetching stats", error);
    res.status(500).json({ error: { message: "Failed to fetch graph stats" } });
  }
}
