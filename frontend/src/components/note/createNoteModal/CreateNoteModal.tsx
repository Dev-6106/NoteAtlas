import { useEffect, useRef, useState } from "react";
import { BaseModal } from "../../base/BaseModal";
import { ClipboardMinus, HardDrive, Link2, Loader2, Newspaper, Upload } from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { toggleAddSourceNoteModal } from "@/store/addSourceSlice";
import { fetchSingleNote } from "@/store/chatSlice";
import useDrivePicker from 'react-google-drive-picker';
import { apiUrl, developerKey, googleClientId } from "@/config/get-env";
import { getUserData } from "@/helper/getUserData";

import { uploadPickedFiles } from "@/api/notes";
import { AddPasteTextForm } from "./AddPasteTextForm";
import AddWebLinkForm from "./AddWebLinkForm";

import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";
import { showInfo } from "@/util/toast-notification";



const CreateNoteModal = ({ noteId }: { noteId?: string }) => {

    const dispatch = useDispatch<AppDispatch>();
    const { modal } = useSelector((state: RootState) => state.addSource);
    const userData = getUserData();



    const [openPicker] = useDrivePicker();
    const handleOpenPicker = async () => {

        openPicker({
            clientId: googleClientId,
            developerKey: developerKey,
            viewId: "DOCS",
            token: userData?.googleAccessToken,
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            callbackFunction: async (data: any) => {
                if (data.action === 'picked') {
                    await uploadPickedFiles(data?.docs, noteId);
                    // Refresh note data to show newly uploaded docs in the sources panel
                    if (noteId) {
                        dispatch(fetchSingleNote(noteId));
                    }
                }
            }
        });

        dispatch(toggleAddSourceNoteModal());


    };


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
                title="NotebookLM"
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
                        fontSize: 18, fontWeight: 700, color: "#f1f5f9",
                        letterSpacing: "-0.3px",
                    }}>
                        Add Sources
                    </h2>
                </div>

                {/* Description */}
                <p style={{
                    fontSize: 14, color: "#64748b", lineHeight: 1.7,
                    marginBottom: 16,
                }}>
                    Sources let NotebookLM base its responses on the information that matters most to you.
                    (Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)
                </p>

                {dropZone && <UploadFileSection noteId={noteId} />}

                {websiteLinkForm && <AddWebLinkForm noteId={noteId} hideWebLinkForm={hideWebLinkForm} />}

                {pasteTextForm && <AddPasteTextForm noteId={noteId} hidePasteTextForm={hidePasteTextForm} />}

                {/* Action cards */}
                <div style={{ display: "flex", gap: 12 }}>
                    {/* Google Workspace */}
                    <div style={{
                        flex: 1, borderRadius: 14, padding: 16,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        transition: "all 0.2s",
                    }}>
                        <p style={{
                            fontSize: 14, fontWeight: 600, color: "#f1f5f9",
                            marginBottom: 16,
                        }}>
                            Google Workspace
                        </p>
                        <button
                            onClick={() => handleOpenPicker()}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 14px", borderRadius: 10,
                                background: "rgba(99,102,241,0.1)",
                                border: "1px solid rgba(99,102,241,0.25)",
                                color: "#a5b4fc", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.18)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.25)";
                            }}
                        >
                            <HardDrive size={15} />
                            Google Drive
                        </button>
                    </div>

                    {/* Link */}
                    <div style={{
                        flex: 1, borderRadius: 14, padding: 16,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        transition: "all 0.2s",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            marginBottom: 16,
                        }}>
                            <Link2 size={16} style={{ color: "#818cf8" }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Link</p>
                        </div>
                        <button
                            onClick={showWebLinkForm}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 14px", borderRadius: 10,
                                background: "rgba(99,102,241,0.1)",
                                border: "1px solid rgba(99,102,241,0.25)",
                                color: "#a5b4fc", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.18)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.25)";
                            }}
                        >
                            <Newspaper size={15} />
                            Website
                        </button>
                    </div>

                    {/* Paste text */}
                    <div style={{
                        flex: 1, borderRadius: 14, padding: 16,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        transition: "all 0.2s",
                    }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            marginBottom: 16,
                        }}>
                            <ClipboardMinus size={16} style={{ color: "#818cf8" }} />
                            <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Paste text</p>
                        </div>
                        <button
                            onClick={showPasteTextForm}
                            style={{
                                padding: "8px 14px", borderRadius: 10,
                                background: "rgba(99,102,241,0.1)",
                                border: "1px solid rgba(99,102,241,0.25)",
                                color: "#a5b4fc", fontSize: 13, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.18)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.25)";
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
            const response = await fetch(`${apiUrl}/api/v1/notes/upload-files`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Upload successful:", data);
            showInfo('File uploaded successfully');
            setLoading(false);
        } catch (error) {
            setLoading(false);
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
                    ? "2px solid rgba(99,102,241,0.6)"
                    : "2px dashed rgba(255,255,255,0.12)",
                background: isDragging
                    ? "rgba(99,102,241,0.08)"
                    : "rgba(255,255,255,0.02)",
                transition: "all 0.2s",
            }}
            onMouseEnter={e => {
                if (!isDragging) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.3)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.04)";
                }
            }}
            onMouseLeave={e => {
                if (!isDragging) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.12)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                }
            }}
        >
            {loading && (
                <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 12, color: "#818cf8",
                }}>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Uploading...</span>
                </div>
            )}

            <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12,
            }}>
                <Upload size={24} style={{ color: "#818cf8" }} />
            </div>

            <p style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 4 }}>
                Upload sources
            </p>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                Drag & drop or{" "}
                <span style={{ color: "#818cf8", fontWeight: 600 }}>choose file</span>{" "}
                to upload
            </p>
            <p style={{ fontSize: 12, color: "#334155" }}>
                Supported file types: PDF, .txt, Markdown
            </p>

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