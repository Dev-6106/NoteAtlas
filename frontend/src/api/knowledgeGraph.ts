import { makeHttpReq } from "@/helper/makeHttpReq";

// ─── Knowledge Graph API ─────────────────────────────────

export interface GraphNode {
  id: string;
  name: string;
  type: "person" | "org" | "concept" | "event" | "product" | "location" | "date" | "other";
  description: string;
  aliases: string[];
  mentionCount: number;
  sourceDocIds: string[];
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: string;
  label: string;
  strength: number;
  evidence: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  sourceDocs?: { id: string; title: string }[];
}

export interface EntityRelationship {
  id: string;
  source: { id: string; name: string };
  target: { id: string; name: string };
  type: string;
  label: string;
  strength: number;
  evidence: string;
  sourceDoc?: { id: string; title: string; content: string } | null;
}

export interface EntityDetail {
  entity: GraphNode & { firstSeen: string };
  relationships: EntityRelationship[];
  sourceDocs: { id: string; title: string }[];
  connectedEntityIds: string[];
}

export interface GraphStats {
  entityCount: number;
  relationshipCount: number;
  typeCounts: Record<string, number>;
}

/**
 * Fetch the full knowledge graph for a notebook.
 */
export async function getKnowledgeGraph(noteId: string): Promise<KnowledgeGraphData> {
  return await makeHttpReq("GET", `notes/${noteId}/graph`) as KnowledgeGraphData;
}

/**
 * Fetch detailed info about a single entity.
 */
export async function getEntityDetail(noteId: string, entityId: string): Promise<EntityDetail> {
  return await makeHttpReq("GET", `notes/${noteId}/graph/entity/${entityId}`) as EntityDetail;
}

/**
 * Trigger knowledge graph generation for a notebook.
 */
export async function generateKnowledgeGraph(
  noteId: string,
  force: boolean = false,
): Promise<{ message: string; docsToProcess?: number; status?: string }> {
  return await makeHttpReq("POST", `notes/${noteId}/graph/generate`, { force }) as any;
}

/**
 * Get quick stats about the knowledge graph.
 */
export async function getGraphStats(noteId: string): Promise<GraphStats> {
  return await makeHttpReq("GET", `notes/${noteId}/graph/stats`) as GraphStats;
}
