import { memo } from "react";
import {
  FileText, NotepadText, PanelLeftClose, PanelLeft, Plus,
  Search, Youtube, Link as LinkIcon,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { toggleLeftPanel } from "@/store/chatSlice";
import { toggleAddSourceNoteModal } from "@/store/addSourceSlice";
import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";
import { setDocIds } from "@/store/rightPanelSlice";
import type { NoteType } from "@/types/note-types";
import { Checkbox } from "../ui/checkbox";
import PdfIcon from "@/assets/pdf.png";

type LeftPanelProps = {
  note: NoteType;
  loading: boolean;
};

export default function LeftPanel({ note, loading }: LeftPanelProps) {
  const dispatch = useAppDispatch();
  const { leftPanelOpen } = useAppSelector((state) => state.chat);
  const { docIds: selectedDocs } = useAppSelector((state) => state.rightPanel);

  function togglePanel() {
    dispatch(toggleLeftPanel());
  }

  function handleDocSelect(docId: string) {
    if (selectedDocs.includes(docId)) {
      dispatch(setDocIds(selectedDocs.filter((id) => id !== docId)));
    } else {
      dispatch(setDocIds([...selectedDocs, docId]));
    }
  }

  const allSelected =
    note?.docs?.length > 0 && selectedDocs.length === note.docs.length;

  function handleSelectAll() {
    if (allSelected) {
      dispatch(setDocIds([]));
    } else {
      dispatch(setDocIds(note?.docs?.map((d) => d._id) || []));
    }
  }

  if (!leftPanelOpen) {
    return (
      <div className="h-full w-12 flex flex-col items-center py-4 border-r border-border/40 bg-background/50">
        <button
          onClick={togglePanel}
          className="p-2 mb-4 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Expand sources panel"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              togglePanel();
              dispatch(toggleAddSourceNoteModal());
            }}
            className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label="Add source"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-border/40 my-1 mx-auto" />

          {note?.docs?.slice(0, 5).map((doc) => (
            <div
              key={doc._id}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary/50 border border-border/40 text-muted-foreground"
              title={doc.title}
            >
              <SourceIcon type={doc.source_type} />
            </div>
          ))}
          {(note?.docs?.length || 0) > 5 && (
            <span className="text-[10px] text-muted-foreground text-center">
              +{note.docs.length - 5}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-72 flex flex-col bg-background/50 p-4 border-r border-border/40">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Sources</h2>
        <button
          onClick={togglePanel}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Collapse sources panel"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-5 shrink-0">
        <button
          onClick={() => dispatch(toggleAddSourceNoteModal())}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded-xl hover:bg-primary/20 transition-colors border border-primary/15"
          aria-label="Add new source"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
        <button
          onClick={() => dispatch(toggleDiscoveryModal())}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-xl hover:bg-muted transition-colors border border-border/60"
          aria-label="Discover sources on the web"
        >
          <Search className="w-3.5 h-3.5" />
          Discover
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 animate-pulse"
              >
                <div className="w-8 h-8 bg-secondary rounded-lg shrink-0" />
                <div className="h-3.5 bg-secondary rounded flex-1" />
                <div className="w-4 h-4 bg-secondary rounded shrink-0" />
              </div>
            ))}
          </div>
        ) : note?.docs?.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 p-2 mb-2 sticky top-0 bg-background/95 backdrop-blur-sm z-10 rounded-lg">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                className="rounded border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                aria-label="Select all sources"
              />
              <span className="text-xs font-medium text-muted-foreground">
                Select all ({note.docs.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {note.docs.map((doc) => (
                <SourceItem
                  key={doc._id}
                  id={doc._id}
                  title={doc.title}
                  sourceType={doc.source_type}
                  isSelected={selectedDocs.includes(doc._id)}
                  onSelect={handleDocSelect}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center fade-in px-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-border/60">
              <NotepadText className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Add sources to start chatting.
              <br />
              Click <strong>Add</strong> above to upload files or paste links.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Memoized source item ─────────────────────────────────

const SourceItem = memo(function SourceItem({
  id,
  title,
  sourceType,
  isSelected,
  onSelect,
}: {
  id: string;
  title: string;
  sourceType: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group ${
        isSelected
          ? "bg-primary/10 border-primary/30 text-foreground"
          : "bg-transparent border-border/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => onSelect(id)}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <div className="shrink-0 w-7 h-7 rounded-lg bg-secondary/80 flex items-center justify-center">
        <SourceIcon type={sourceType} />
      </div>
      <span className="flex-1 text-sm font-medium truncate">{title}</span>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelect(id)}
        className="rounded border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        onClick={(e) => e.stopPropagation()}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
});

function SourceIcon({ type = "" }: { type?: string }) {
  const normalized = type.toLowerCase();

  if (normalized.includes("youtube")) {
    return <Youtube className="w-3.5 h-3.5 text-red-400" />;
  }
  if (normalized.includes("pdf")) {
    return (
      <img src={PdfIcon} alt="PDF" className="w-3.5 h-3.5 rounded-sm opacity-80" />
    );
  }
  if (normalized.includes("web") || normalized.includes("http")) {
    return <LinkIcon className="w-3.5 h-3.5 text-green-400" />;
  }
  return <FileText className="w-3.5 h-3.5 text-blue-400" />;
}
