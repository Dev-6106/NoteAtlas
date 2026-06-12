/**
 * KnowledgeGraphView.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive force-directed knowledge graph using react-force-graph-2d.
 * Features: animated nodes, glow effects, entity type coloring, zoom,
 * click-to-select, neighborhood highlighting.
 */

import { useRef, useCallback, useMemo, useEffect, useState } from "react";
import ForceGraph2D, { type ForceGraphMethods } from "react-force-graph-2d";
import type { GraphNode, GraphLink } from "@/api/knowledgeGraph";
import { T } from "@/components/ThemeTokens";
import { selectEntity } from "@/store/knowledgeGraphSlice";

// ─── Entity type → color mapping ─────────────────────────

const TYPE_COLORS: Record<string, string> = {
  person: "#60a5fa",    // blue
  org: "#34d399",       // green
  concept: "#a78bfa",   // purple
  event: "#fbbf24",     // amber
  product: "#f472b6",   // pink
  location: "#fb923c",  // orange
  date: "#94a3b8",      // slate
  other: "#e2e8f0",     // light gray
};

const TYPE_GLOW_COLORS: Record<string, string> = {
  person: "rgba(96, 165, 250, 0.4)",
  org: "rgba(52, 211, 153, 0.4)",
  concept: "rgba(167, 139, 250, 0.4)",
  event: "rgba(251, 191, 36, 0.4)",
  product: "rgba(244, 114, 182, 0.4)",
  location: "rgba(251, 146, 60, 0.4)",
  date: "rgba(148, 163, 184, 0.3)",
  other: "rgba(226, 232, 240, 0.2)",
};

interface KnowledgeGraphViewProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedEntityId: string | null;
  connectedEntityIds: string[];
  searchQuery: string;
  activeFilters: string[];
  activeDocFilters?: string[];
  onNodeClick: (nodeId: string) => void;
  onBackgroundClick: () => void;
}

export default function KnowledgeGraphView({
  nodes,
  links,
  selectedEntityId,
  connectedEntityIds,
  searchQuery,
  activeFilters,
  activeDocFilters = [],
  onNodeClick,
  onBackgroundClick,
}: KnowledgeGraphViewProps) {
  const graphRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const hoveredNodeRef = useRef<string | null>(null);

  // ── Resize observer ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ── Filter nodes ──
  const filteredData = useMemo(() => {
    let filteredNodes = nodes;

    // Apply type filters
    if (activeFilters.length > 0) {
      filteredNodes = filteredNodes.filter((n) => activeFilters.includes(n.type));
    }

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(
        (n) =>
          n.name.toLowerCase().includes(q) ||
          n.description?.toLowerCase().includes(q) ||
          n.aliases?.some((a) => a.toLowerCase().includes(q)),
      );
    }

    // Apply document filters
    if (activeDocFilters.length > 0) {
      filteredNodes = filteredNodes.filter((n) =>
        n.sourceDocIds?.some((docId) => activeDocFilters.includes(docId)),
      );
    }

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = links.filter(
      (l) => nodeIds.has(l.source as string) && nodeIds.has(l.target as string),
    );

    // Shallow clone nodes and links because react-force-graph mutates them (e.g. adding x, y, vx, vy)
    // Redux Toolkit freezes state objects, which causes "object is not extensible" errors otherwise.
    return {
      nodes: filteredNodes.map(n => ({ ...n })),
      links: filteredLinks.map(l => ({ ...l })),
    };
  }, [nodes, links, activeFilters, activeDocFilters, searchQuery]);

  // ── Node rendering ──
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = node.id as string;
      const name = node.name as string;
      const type = (node.type as string) || "other";
      const mentions = (node.mentionCount as number) || 1;

      const isSelected = id === selectedEntityId;
      const isConnected = connectedEntityIds.includes(id);
      const isHovered = id === hoveredNodeRef.current;
      const isHighlighted = isSelected || isConnected || isHovered;
      const isDimmed =
        (selectedEntityId && !isSelected && !isConnected) ||
        false;

      // Node size based on mentions
      const baseRadius = 4 + Math.min(mentions * 1.5, 12);
      const radius = isSelected ? baseRadius * 1.4 : isHovered ? baseRadius * 1.2 : baseRadius;

      const color = TYPE_COLORS[type] || TYPE_COLORS.other;
      const glowColor = TYPE_GLOW_COLORS[type] || TYPE_GLOW_COLORS.other;

      // ── Glow effect ──
      if (isHighlighted) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2.5, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(
          node.x, node.y, radius * 0.5,
          node.x, node.y, radius * 2.5,
        );
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }

      // ── Node circle ──
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isDimmed ? `${color}44` : color;
      ctx.fill();

      // ── Border ring for selected ──
      if (isSelected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // ── Label ──
      const labelOpacity = isDimmed ? 0.2 : isHighlighted ? 1 : 0.85;
      const fontSize = isSelected ? 13 / globalScale : isHovered ? 12 / globalScale : 10 / globalScale;
      ctx.font = `${isHighlighted ? "600" : "400"} ${fontSize}px 'DM Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      // Text shadow for readability
      ctx.fillStyle = `rgba(10, 10, 20, ${labelOpacity * 0.7})`;
      ctx.fillText(name, node.x + 0.5, node.y + radius + 3.5);
      ctx.fillStyle = isDimmed
        ? `rgba(200, 200, 220, ${labelOpacity})`
        : `rgba(240, 240, 255, ${labelOpacity})`;
      ctx.fillText(name, node.x, node.y + radius + 3);
    },
    [selectedEntityId, connectedEntityIds],
  );

  // ── Link rendering ──
  const paintLink = useCallback(
    (link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;

      const isHighlighted =
        selectedEntityId &&
        (connectedEntityIds.includes(sourceId) || connectedEntityIds.includes(targetId)) &&
        (sourceId === selectedEntityId || targetId === selectedEntityId);

      const isDimmed = selectedEntityId && !isHighlighted;

      const sx = typeof link.source === "object" ? link.source.x : 0;
      const sy = typeof link.source === "object" ? link.source.y : 0;
      const tx = typeof link.target === "object" ? link.target.x : 0;
      const ty = typeof link.target === "object" ? link.target.y : 0;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = isHighlighted
        ? "rgba(167, 139, 250, 0.6)"
        : isDimmed
          ? "rgba(100, 100, 140, 0.08)"
          : "rgba(100, 100, 140, 0.2)";
      ctx.lineWidth = isHighlighted ? 1.5 / globalScale : 0.5 / globalScale;
      ctx.stroke();

      // ── Edge label (only when highlighted & zoomed in) ──
      if (isHighlighted && globalScale > 1.5 && link.label) {
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;
        const fontSize = 9 / globalScale;
        ctx.font = `400 ${fontSize}px 'DM Sans', system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(167, 139, 250, 0.9)";
        ctx.fillText(link.label, midX, midY);
      }
    },
    [selectedEntityId, connectedEntityIds],
  );

  // ── Zoom to fit on first load ──
  useEffect(() => {
    if (filteredData.nodes.length > 0 && graphRef.current) {
      setTimeout(() => {
        graphRef.current?.zoomToFit(600, 60);
      }, 300);
    }
  }, [filteredData.nodes.length]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "var(--bg-base)",
        borderRadius: T.radius,
        overflow: "hidden",
      }}
    >
      {/* Animated background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, var(--border-strong) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.3,
        }}
      />

      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={filteredData}
        nodeId="id"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          const radius = 4 + Math.min((node.mentionCount || 1) * 1.5, 12);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkCanvasObject={paintLink}
        onNodeClick={(node: any) => onNodeClick(node.id)}
        onNodeHover={(node: any) => { hoveredNodeRef.current = node?.id || null; }}
        onBackgroundClick={onBackgroundClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={50}
        backgroundColor="rgba(0,0,0,0)"
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
    </div>
  );
}
