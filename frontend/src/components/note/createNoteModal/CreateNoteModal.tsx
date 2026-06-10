import { useEffect, useRef, useState } from "react";
import { BaseModal } from "../../base/BaseModal";
import { ClipboardMinus, HardDrive, Link2, Loader2, Newspaper, Upload, CheckCircle2, FileText, Database, Zap } from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { toggleAddSourceNoteModal } from "@/store/addSourceSlice";
import { fetchSingleNote } from "@/store/chatSlice";
import { getUserData } from "@/helper/getUserData";

import { AddPasteTextForm } from "./AddPasteTextForm";
import AddWebLinkForm from "./AddWebLinkForm";

import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";
import { showInfo } from "@/util/toast-notification";



const CreateNoteModal = ({ noteId }: { noteId?: string }) => {

    const dispatch = useDispatch<AppDispatch>();
    const { modal } = useSelector((state: RootState) => state.addSource);
    const userData = getUserData();



    const [dropZone, setDropZone] = useState(true);

    const [websiteLinkForm, setWebsiteLinkForm] = useState(false);
    const [pasteTextForm, setPasteTextForm] = useState(false);


    //web linkform
    const hideWebLinkForm = () => {
        setWebsiteLinkForm(false);
        setDropZone(true);
    };

    const showWebLinkForm = () => {
        setWebsiteLinkForm(true);
        setDropZone(false);
    };

    //paste text form
    const hidePasteTextForm = () => {
        setPasteTextForm(false);
        setDropZone(true);
    };

    const showPasteTextForm = () => {
        setPasteTextForm(true);
        setDropZone(false);
    };


    return (
        <div>
            <BaseModal
                open={modal}
                onOpenChange={() => dispatch(toggleAddSourceNoteModal())}
                title="NoteAtlas"
                description=""
                width={850}
                height={600}
                footer={<></>}
            >
                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 24,
                }}>
                    <h2 style={{
                        fontSize: 18, fontWeight: 700, color: "var(--text-1)",
                        letterSpacing: "-0.3px",
                    }}>
                        Add Sources
                    </h2>
                </div>

                {/* Description */}
                <p style={{
                    fontSize: 14, color: "var(--text-3)", lineHeight: 1.7,
                    marginBottom: 16,
                }}>
                    Sources let NoteAtlas base its responses on the information that matters most to you.
                    (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
                </p>

                {dropZone && <UploadFileSection noteId={noteId} />}

                {websiteLinkForm && <AddWebLinkForm noteId={noteId} hideWebLinkForm={hideWebLinkForm} />}

                {pasteTextForm && <AddPasteTextForm noteId={noteId} hidePasteTextForm={hidePasteTextForm} />}

                {/* Action cards */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>

                    {/* Link */}
                    <div style={{
                        flex: 1, minWidth: 140, borderRadius: 14, padding: 16,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                        transition: "all 0.2s",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            marginBottom: 16,
                        }}>
                            <Link2 size={16} style={{ color: "var(--primary-brand)" }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Link</p>
                        </div>
                        <button
                            onClick={showWebLinkForm}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 14px", borderRadius: 10,
                                background: "var(--primary-glow)",
                                border: "1px solid var(--primary-border)",
                                color: "var(--primary-brand)", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-glow)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary-brand)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary-border)";
                            }}
                        >
                            <Newspaper size={15} />
                            Website
                        </button>
                    </div>

                    {/* Paste text */}
                    <div style={{
                        flex: 1, minWidth: 140, borderRadius: 14, padding: 16,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                        transition: "all 0.2s",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            marginBottom: 16,
                        }}>
                            <ClipboardMinus size={16} style={{ color: "var(--primary-brand)" }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Paste text</p>
                        </div>
                        <button
                            onClick={showPasteTextForm}
                            style={{
                                padding: "8px 14px", borderRadius: 10,
                                background: "var(--primary-glow)",
                                border: "1px solid var(--primary-border)",
                                color: "var(--primary-brand)", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-glow)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary-brand)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary-border)";
                            }}
                        >
                            Copied text
                        </button>
                    </div>
                </div>
            </BaseModal>
        </div>
    );
};


const UploadFileSection = ({ noteId }: { noteId?: string }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [ingestStep, setIngestStep] = useState(0);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFiles(files);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (loading) return;
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFiles(files);
        }
    };

    const uploadFiles = async (files: FileList) => {
        setLoading(true);
        const formData = new FormData();
        const userData = getUserData();
        const userId = userData?._id;
        Array.from(files).forEach((file) => {
            formData.append("doc", file);
            formData.append("userId", userId);
            formData.append("noteId", noteId as string);
        });

        try {
            setIngestStep(0);
            
            // Start simulation of ingestion steps
            const stepInterval = setInterval(() => {
                setIngestStep(prev => {
                    if (prev >= 3) {
                        clearInterval(stepInterval);
                        return 3;
                    }
                    return prev + 1;
                });
            }, 1200);

            const response = await fetch(`${apiUrl}/api/v1/notes/upload-files`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            clearInterval(stepInterval);
            setIngestStep(4); // Finished
            
            setTimeout(() => {
                showInfo('File uploaded successfully');
                setLoading(false);
                setIngestStep(0);
            }, 800);
        } catch (error) {
            setLoading(false);
            setIngestStep(0);
            console.error("Error uploading files:", error);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                marginBottom: 28, marginTop: 20,
                borderRadius: 14, padding: 32,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                textAlign: "center", cursor: "pointer",
                border: isDragging
                    ? "2px solid var(--primary-brand)"
                    : "2px dashed var(--primary-border)",
                background: isDragging
                    ? "var(--primary-glow)"
                    : "var(--primary-surface)",
                transition: "all 0.2s",
            }}
            onMouseEnter={e => {
                if (!isDragging) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary-brand)";
                    (e.currentTarget as HTMLDivElement).style.background = "var(--primary-glow)";
                }
            }}
            onMouseLeave={e => {
                if (!isDragging) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary-border)";
                    (e.currentTarget as HTMLDivElement).style.background = "var(--primary-surface)";
                }
            }}
        >
            {loading ? (
                <div style={{
                    display: "flex", flexDirection: "column", gap: 12,
                    marginBottom: 20, width: "100%", maxWidth: 280
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: ingestStep >= 0 ? "var(--primary-brand)" : "var(--text-3)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ingestStep > 0 ? <CheckCircle2 size={16} /> : (ingestStep === 0 ? <Loader2 size={16} className="spin" /> : <Upload size={16} />)}
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Uploading files...</span>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: ingestStep >= 1 ? "var(--primary-brand)" : "var(--text-4)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ingestStep > 1 ? <CheckCircle2 size={16} /> : (ingestStep === 1 ? <Loader2 size={16} className="spin" /> : <FileText size={16} />)}
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Parsing documents...</span>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: ingestStep >= 2 ? "var(--primary-brand)" : "var(--text-4)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ingestStep > 2 ? <CheckCircle2 size={16} /> : (ingestStep === 2 ? <Loader2 size={16} className="spin" /> : <Zap size={16} />)}
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Chunking & Embedding...</span>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: ingestStep >= 3 ? "var(--primary-brand)" : "var(--text-4)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ingestStep >= 4 ? <CheckCircle2 size={16} /> : (ingestStep === 3 ? <Loader2 size={16} className="spin" /> : <Database size={16} />)}
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Indexing to Vector DB...</span>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: "var(--primary-glow)",
                        border: "1px solid var(--primary-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 12,
                    }}>
                        <Upload size={24} style={{ color: "var(--primary-brand)" }} />
                    </div>

                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
                        Upload sources
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 6 }}>
                        Drag & drop or{" "}
                        <span style={{ color: "var(--primary-brand)", fontWeight: 600 }}>choose file</span>{" "}
                        to upload
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-4)" }}>
                        Supported file types: PDF, .txt, Markdown
                    </p>
                </>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                multiple
            />

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};


export default CreateNoteModal;