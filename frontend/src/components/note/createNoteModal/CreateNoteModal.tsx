import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Loader2, Sparkles, Folder, UploadCloud, File as FileIcon, Youtube, Link as LinkIcon, Type } from "lucide-react";

import { createBlankNote, createNoteWithDoc } from "@/api/notes";
import { useAppDispatch } from "@/hooks/useTypedStore";
import { fetchNotes } from "@/store/noteSlice";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import AddYoutubeLinkForm from "./AddYoutubeForm";
import AddWebLinkForm from "./AddWebLinkForm";
import AddPasteTextForm from "./AddPasteTextForm";

interface Props {
  onClose: () => void;
}

type Tab = "file" | "youtube" | "weblink" | "text";

export default function CreateNoteModal({ onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Create notebook with file or blank
  const handleCreateNote = async () => {
    setIsLoading(true);
    try {
      let data;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("doc", selectedFile);
        data = await createNoteWithDoc(formData);
      } else {
        data = await createBlankNote();
      }

      if (data?.newNote?._id) {
        dispatch(fetchNotes({ page: 1, search: "", userId: user?._id }));
        navigate(`/notes/${data.newNote._id}`);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // For other tabs (YouTube, Web, Text), we need a blank note first
  const [tempNoteId, setTempNoteId] = useState<string | null>(null);

  // We wrap the forms to handle the blank note creation seamlessly
  const handleTabFormComplete = (noteId: string) => {
    dispatch(fetchNotes({ page: 1, search: "", userId: user?._id }));
    navigate(`/notes/${noteId}`);
    onClose();
  };

  const getOrCreateBlankNote = async () => {
    if (tempNoteId) return tempNoteId;
    const data = await createBlankNote();
    if (data?.newNote?._id) {
      setTempNoteId(data.newNote._id);
      return data.newNote._id;
    }
    throw new Error("Failed to create blank note");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card border-border/60 shadow-xl">
        <div className="p-6 sm:p-8">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">Create Notebook</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Upload a document or add a source to begin.
              </DialogDescription>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary/50 p-1 rounded-xl mb-6">
            <TabButton active={activeTab === "file"} onClick={() => setActiveTab("file")}>
              <UploadCloud className="w-4 h-4" /> File
            </TabButton>
            <TabButton active={activeTab === "youtube"} onClick={() => setActiveTab("youtube")}>
              <Youtube className="w-4 h-4" /> YouTube
            </TabButton>
            <TabButton active={activeTab === "weblink"} onClick={() => setActiveTab("weblink")}>
              <LinkIcon className="w-4 h-4" /> Link
            </TabButton>
            <TabButton active={activeTab === "text"} onClick={() => setActiveTab("text")}>
              <Type className="w-4 h-4" /> Text
            </TabButton>
          </div>

          {/* Content */}
          <div className="min-h-[220px]">
            {activeTab === "file" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full p-8 mb-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    selectedFile ? "border-primary bg-primary/5" : "border-border/60 bg-background/50 hover:bg-muted"
                  }`}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt,.csv"
                  />
                  {selectedFile ? (
                    <>
                      <FileIcon className="w-8 h-8 text-primary mb-3" />
                      <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-muted-foreground mb-3" />
                      <span className="text-sm font-medium text-foreground">Click to upload a document</span>
                      <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, CSV (Max 2MB)</span>
                    </>
                  )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-lg font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateNote}
                    disabled={isLoading}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {selectedFile ? "Upload & Create" : "Create Empty"}
                  </button>
                </DialogFooter>
              </div>
            )}

            {/* Note: For these tabs, we hijack the forms. 
                When submitted, the form expects a noteId. We generate a blank one right before submission or let a wrapper handle it.
                To keep it simple, we use a wrapper component for these tabs to handle the blank note creation flow. */}
            
            {activeTab === "youtube" && (
              <FormWrapper 
                getNoteId={getOrCreateBlankNote} 
                onComplete={(id) => handleTabFormComplete(id)}
              >
                {(noteId) => <AddYoutubeLinkForm noteId={noteId} onComplete={() => handleTabFormComplete(noteId)} />}
              </FormWrapper>
            )}

            {activeTab === "weblink" && (
              <FormWrapper 
                getNoteId={getOrCreateBlankNote} 
                onComplete={(id) => handleTabFormComplete(id)}
              >
                {(noteId) => <AddWebLinkForm noteId={noteId} onComplete={() => handleTabFormComplete(noteId)} />}
              </FormWrapper>
            )}

            {activeTab === "text" && (
              <FormWrapper 
                getNoteId={getOrCreateBlankNote} 
                onComplete={(id) => handleTabFormComplete(id)}
              >
                {(noteId) => <AddPasteTextForm noteId={noteId} onComplete={() => handleTabFormComplete(noteId)} />}
              </FormWrapper>
            )}
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subcomponents ──────────────────────────────────────────

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
        active 
          ? "bg-background text-foreground shadow-sm ring-1 ring-border/50" 
          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
      }`}
    >
      {children}
    </button>
  );
}

// Wrapper that passes the resolved blank note ID to the child form
function FormWrapper({ 
  getNoteId, 
  children 
}: { 
  getNoteId: () => Promise<string>;
  onComplete: (id: string) => void;
  children: (noteId: string) => React.ReactNode;
}) {
  const [noteId, setNoteId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  // We need the ID as soon as the tab mounts so the child form can submit to it.
  // Actually, wait! The child form shouldn't submit until the ID is ready.
  // Let's resolve the ID first.
  useState(() => {
    getNoteId().then(setNoteId).catch(() => setError(true));
  });

  if (error) return <div className="text-destructive text-sm py-4 text-center">Failed to initialize. Please try again.</div>;
  if (!noteId) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return <>{children(noteId)}</>;
}