import { useState } from "react";
import {
  PanelRight, PanelRightClose, Sparkles, Video, GitBranch,
  FileText, Music2, Loader2, FileAudio,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { toggleRightPanel } from "@/store/chatSlice";
import { fetchNoteSourceResult, showSourceModalContent } from "@/store/rightPanelSlice";
import {
  createBriefingDoc, createFAQ, createMindMap, createStudyGuide, createSummary,
} from "@/api/notes";
import { showError } from "@/util/toast-notification";
import { truncateTitle } from "@/util/truncateTitle";
import { env } from "@/config/env";
import type { SourceResultType } from "@/types/note-types";

import { SourceModal } from "../note/rightpanel/SourceModal";
import MindMapSourceModal from "../note/rightpanel/MindMapSourceModal";
import AudioSection from "./AudioSection";

export default function RightPanel({ noteId }: { noteId?: string }) {
  const dispatch = useAppDispatch();
  const { rightPanelOpen } = useAppSelector((state) => state.chat);
  const { docIds, sources, audioCard } = useAppSelector((state) => state.rightPanel);

  const [audioLoading, setAudioLoading] = useState(false);
  const [mindMapLoading, setMindMapLoading] = useState(false);

  function togglePanel() {
    dispatch(toggleRightPanel());
  }

  function fetchSources() {
    if (noteId) dispatch(fetchNoteSourceResult(noteId));
  }

  async function generateMindMap() {
    if (docIds.length === 0) {
      showError("Please select at least one source document");
      return;
    }
    setMindMapLoading(true);
    try {
      await createMindMap(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate mind map.");
    } finally {
      setMindMapLoading(false);
    }
  }

  async function generateAudio() {
    if (docIds.length === 0) {
      showError("Please select at least one source document");
      return;
    }
    setAudioLoading(true);
    try {
      await createBriefingDoc(noteId!, docIds, "audio");
      fetchSources();
    } catch {
      showError("Failed to generate audio briefing.");
    } finally {
      setAudioLoading(false);
    }
  }

  if (!rightPanelOpen) {
    return (
      <div className="h-full w-12 flex flex-col items-center py-4 border-l border-border/40 bg-background/50">
        <button
          onClick={togglePanel}
          className="p-2 mb-4 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Expand studio panel"
        >
          <PanelRight className="w-4 h-4" />
        </button>
        <div className="flex flex-col gap-2">
          <CollapsedIcon icon={<Sparkles className="w-4 h-4" />} color="text-emerald-400" title="Audio Overview" />
          <CollapsedIcon icon={<Video className="w-4 h-4" />} color="text-blue-400" title="Video Overview" />
          <CollapsedIcon icon={<GitBranch className="w-4 h-4" />} color="text-orange-400" title="Mind Map" />
          <CollapsedIcon icon={<FileText className="w-4 h-4" />} color="text-foreground" title="Reports" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-80 flex flex-col bg-background/50 p-4 border-l border-border/40">
      <SourceModal />
      <MindMapSourceModal />

      {/* Header */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Studio</h2>
        <button
          onClick={togglePanel}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Collapse studio panel"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-5 shrink-0">
        <PanelItem
          icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
          label="Audio Overview"
          bgClass="bg-emerald-500/[0.06] hover:bg-emerald-500/[0.12] border-emerald-500/15"
          onClick={generateAudio}
          loading={audioLoading}
        />
        <PanelItem
          icon={<Video className="w-5 h-5 text-blue-400" />}
          label="Video Overview"
          bgClass="bg-blue-500/[0.06] hover:bg-blue-500/[0.12] border-blue-500/15"
          onClick={() => showError("Video generation coming soon!")}
        />
        <PanelItem
          icon={<GitBranch className="w-5 h-5 text-orange-400" />}
          label="Mind Map"
          bgClass="bg-orange-500/[0.06] hover:bg-orange-500/[0.12] border-orange-500/15"
          onClick={generateMindMap}
          loading={mindMapLoading}
        />
        <ReportPanelItem noteId={noteId!} docIds={docIds} fetchSources={fetchSources} />
      </div>

      {/* Audio Player */}
      {audioCard?.show && audioCard?.content && (
        <div className="mb-5 shrink-0 scale-in">
          <AudioSection
            audioUrl={`${env.apiUrl}/api/v1/notes/read/audios/${audioCard.content}`}
            title={audioCard.title}
          />
        </div>
      )}

      <div className="flex items-center gap-4 text-muted-foreground/40 mb-3 shrink-0">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-[11px] font-semibold uppercase tracking-widest">
          Generated
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* Generated Sources List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sources?.length > 0 ? (
          <div className="space-y-1.5">
            {sources.map((source) => (
              <div
                key={source._id}
                onClick={() => dispatch(showSourceModalContent(source))}
                className="flex items-center gap-3 p-2.5 rounded-xl surface surface-hover cursor-pointer group"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") dispatch(showSourceModalContent(source));
                }}
              >
                <div className="shrink-0 w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center">
                  <SourceIcon type={source.source_type} />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {source.title || "Untitled Document"}
                  </span>
                  <span className="text-[11px] text-muted-foreground capitalize">
                    {source.source_type.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center fade-in px-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-border/60">
              <FileAudio className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Generated reports, audio briefings, and mind maps will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function CollapsedIcon({ icon, color, title }: { icon: React.ReactNode; color: string; title: string }) {
  return (
    <div
      className={`w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/50 border border-border/40 ${color}`}
      title={title}
    >
      {icon}
    </div>
  );
}

function PanelItem({
  icon,
  label,
  bgClass,
  onClick,
  loading = false,
}: {
  icon: React.ReactNode;
  label: string;
  bgClass: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col items-center justify-center gap-1.5 p-3.5 h-20 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed group ${bgClass}`}
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
      )}
      <span className="text-[11px] font-medium text-foreground">
        {loading ? "Generating..." : label}
      </span>
    </button>
  );
}

function ReportPanelItem({
  noteId,
  docIds,
  fetchSources,
}: {
  noteId: string;
  docIds: string[];
  fetchSources: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const menuItems = ["Summary", "Study Guide", "Briefing Doc", "FAQ"];

  async function generateSource(item: string) {
    if (docIds.length === 0) {
      showError("Please select at least one source document");
      return;
    }
    setLoading(true);
    try {
      if (item === "Summary") await createSummary(noteId, docIds);
      else if (item === "FAQ") await createFAQ(noteId, docIds);
      else if (item === "Study Guide") await createStudyGuide(noteId, docIds);
      else if (item === "Briefing Doc")
        await createBriefingDoc(noteId, docIds, "briefing-doc");
      fetchSources();
    } catch {
      showError(`Failed to generate ${item.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={loading}
          className="flex flex-col items-center justify-center gap-1.5 p-3.5 h-20 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/60 transition-all disabled:opacity-50 group"
          aria-label="Generate reports"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <FileText className="w-5 h-5 text-foreground group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] font-medium text-foreground">Reports</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44 bg-popover/95 backdrop-blur-xl border-border/50 rounded-xl shadow-xl p-1"
      >
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item}
            onClick={() => generateSource(item)}
            className="cursor-pointer text-sm font-medium focus:bg-primary/10 focus:text-foreground rounded-lg px-3 py-2 my-0.5 transition-colors"
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SourceIcon({ type = "" }: { type?: string }) {
  const normalized = type.toLowerCase();
  if (normalized.includes("audio"))
    return <Music2 className="w-3.5 h-3.5 text-emerald-400" />;
  if (normalized.includes("mindmap"))
    return <GitBranch className="w-3.5 h-3.5 text-orange-400" />;
  return <FileText className="w-3.5 h-3.5 text-foreground" />;
}
