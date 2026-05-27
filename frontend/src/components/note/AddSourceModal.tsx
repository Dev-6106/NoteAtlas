import { useState, useRef } from "react";
import { Loader2, Sparkles, Folder, UploadCloud, File as FileIcon, Youtube, Link as LinkIcon, Type } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { fetchSingleNote } from "@/store/chatSlice";
import { fetchNoteSourceResult } from "@/store/rightPanelSlice";
import { closeAddSourceModal } from "@/store/addSourceSlice";
import { uploadPickedFiles } from "@/api/notes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { showError, showSuccess } from "@/util/toast-notification";

import AddYoutubeLinkForm from "./createNoteModal/AddYoutubeForm";
import AddWebLinkForm from "./createNoteModal/AddWebLinkForm";
import AddPasteTextForm from "./createNoteModal/AddPasteTextForm";

interface Props {
  noteId?: string;
}

type Tab = "file" | "youtube" | "weblink" | "text";

export function AddSourceModal({ noteId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const { modal } = useAppSelector((state) => state.addSource);

  const onClose = () => dispatch(closeAddSourceModal());

  // Upload file to existing notebook
  const handleUploadFile = async () => {
    if (!selectedFile) return;
    if (!noteId) {
      showError("Notebook ID missing");
      return;
    }
    setIsLoading(true);
    try {
      // Create a mock doc object to conform to uploadPickedFiles signature
      // (Assuming the backend endpoint accepts this format or we adapt it)
      // Wait, uploadPickedFiles in api/notes.ts calls `/api/v1/notes/drive-files`
      // Actually, drive-files is for Google Drive files (fileId).
      // For local files to existing note, there isn't a direct API in notes.ts!
      // Let's check api/notes.ts: `createNoteWithDoc` does POST `/api/v1/notes` with formData.
      // Wait, does it update if `noteId` is in formData? Yes! We will use the same endpoint or adapt.
      
      const formData = new FormData();
      formData.append("doc", selectedFile);
      formData.append("noteId", noteId); // the backend handles adding to existing
      
      // Let's use the fetch directly since notes.ts might not expose the right wrapper
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/notes`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("userData") || "{}")?.token?.accessToken || ""}`,
        }
      });

      if (!res.ok) throw new Error("Failed to upload");

      showSuccess("File added successfully");
      dispatch(fetchSingleNote(noteId));
      dispatch(fetchNoteSourceResult(noteId));
      onClose();
    } catch (err) {
      showError("Failed to upload file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTabComplete = () => {
    if (noteId) {
      dispatch(fetchSingleNote(noteId));
      dispatch(fetchNoteSourceResult(noteId));
    }
    onClose();
  };

  return (
    <Dialog open={modal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-card border-border/60 shadow-xl">
        <div className="p-6 sm:p-8">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Folder className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">Add Source</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Upload a document or link to add to this notebook.
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
                    onClick={handleUploadFile}
                    disabled={isLoading || !selectedFile}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Upload to Notebook
                  </button>
                </DialogFooter>
              </div>
            )}

            {activeTab === "youtube" && (
              <AddYoutubeLinkForm noteId={noteId} onComplete={handleTabComplete} />
            )}

            {activeTab === "weblink" && (
              <AddWebLinkForm noteId={noteId} onComplete={handleTabComplete} />
            )}

            {activeTab === "text" && (
              <AddPasteTextForm noteId={noteId} onComplete={handleTabComplete} />
            )}
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
