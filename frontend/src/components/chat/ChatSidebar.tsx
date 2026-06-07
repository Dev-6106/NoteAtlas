import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, Plus, MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { createConversationApi, renameConversationApi, deleteConversationApi, duplicateConversationApi } from '@/api/notes';
import { fetchConversations, fetchChats, setActiveConversation, setIsNewChatDraft } from '@/store/chatHistorySlice';

export const ChatSidebar = ({ noteId, userId }: { noteId: string, userId: string }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { conversations, activeConversationId } = useSelector((state: RootState) => state.chatHistory);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editChatTitle, setEditChatTitle] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const handleNewChat = () => {
        dispatch(setIsNewChatDraft(true));
    };

    const handleSelectChat = (id: string) => {
        dispatch(setActiveConversation(id));
        dispatch(fetchChats({ userId, noteId, conversationId: id }));
    };

    const handleRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setEditingChatId(id);
        setEditChatTitle(currentTitle);
    };

    const saveRename = async (id: string, currentTitle: string) => {
        if (editChatTitle && editChatTitle.trim() !== "" && editChatTitle !== currentTitle) {
            await renameConversationApi(id, editChatTitle.trim());
            dispatch(fetchConversations(noteId));
        }
        setEditingChatId(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setDeleteConfirmId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmId) {
            await deleteConversationApi(deleteConfirmId);
            dispatch(fetchConversations(noteId));
            if (activeConversationId === deleteConfirmId) {
                dispatch(setActiveConversation(null));
                // fetchChats will be handled after we get the new conversations list
            }
            setDeleteConfirmId(null);
        }
    };

    const handleDuplicate = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setOpenMenuId(null);
        await duplicateConversationApi(id);
        dispatch(fetchConversations(noteId));
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: 240,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-default)",
        }}>
            <div style={{ padding: "16px 12px 12px" }}>
                <button
                    onClick={handleNewChat}
                    style={{
                        width: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        padding: "10px", borderRadius: 10,
                        background: activeConversationId === null ? "var(--bg-card-hover)" : "var(--primary-glow)",
                        border: "1px solid var(--border-accent)",
                        color: "var(--primary-brand)",
                        fontSize: 13, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-card-hover)";
                    }}
                    onMouseLeave={(e) => {
                        if (activeConversationId !== null) {
                            e.currentTarget.style.background = "var(--primary-glow)";
                        }
                    }}
                >
                    <Plus size={16} />
                    New Chat
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }} className="studio-scroll">
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, paddingLeft: 4 }}>
                    Recent Chats
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {conversations.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => handleSelectChat(conv._id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 10px", borderRadius: 8,
                                background: activeConversationId === conv._id ? "var(--bg-elevated)" : "transparent",
                                color: activeConversationId === conv._id ? "var(--text-1)" : "var(--text-2)",
                                cursor: "pointer", transition: "all 0.15s",
                                border: "1px solid transparent",
                                borderColor: activeConversationId === conv._id ? "var(--border-default)" : "transparent"
                            }}
                            onMouseEnter={e => {
                                if (activeConversationId !== conv._id) e.currentTarget.style.background = "var(--bg-card-hover)";
                            }}
                            onMouseLeave={e => {
                                if (activeConversationId !== conv._id) e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <MessageSquare size={14} style={{ color: activeConversationId === conv._id ? "var(--primary-brand)" : "var(--text-3)" }} />
                            {editingChatId === conv._id ? (
                                <input
                                    autoFocus
                                    value={editChatTitle}
                                    onChange={(e) => setEditChatTitle(e.target.value)}
                                    onBlur={() => saveRename(conv._id, conv.title)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveRename(conv._id, conv.title);
                                        if (e.key === 'Escape') setEditingChatId(null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: "var(--text-1)",
                                        background: "var(--bg-elevated)",
                                        border: "1px solid var(--border-accent)",
                                        borderRadius: 4,
                                        padding: "2px 6px",
                                        outline: "none",
                                    }}
                                />
                            ) : (
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {conv.title}
                                </span>
                            )}
                            
                            <div style={{ position: "relative" }}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === conv._id ? null : conv._id); }}
                                    style={{
                                        background: "transparent", border: "none", color: "var(--text-3)",
                                        cursor: "pointer", display: "flex", padding: 2, borderRadius: 4
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
                                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}
                                >
                                    <MoreVertical size={14} />
                                </button>

                                {openMenuId === conv._id && (
                                    <>
                                        <div onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
                                        <div style={{
                                            position: "absolute", top: 24, right: 0, zIndex: 20,
                                            background: "var(--bg-elevated)", border: "1px solid var(--border-default)",
                                            borderRadius: 8, padding: 4, minWidth: 130, boxShadow: "var(--shadow-lg)"
                                        }}>
                                            <MenuButton icon={<Edit2 size={13}/>} label="Rename" onClick={(e) => handleRename(e, conv._id, conv.title)} />
                                            <MenuButton icon={<Copy size={13}/>} label="Duplicate" onClick={(e) => handleDuplicate(e, conv._id)} />
                                            <div style={{ height: 1, background: "var(--border-default)", margin: "2px 0" }} />
                                            <MenuButton icon={<Trash2 size={13}/>} label="Delete" danger onClick={(e) => handleDeleteClick(e, conv._id)} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div 
                    onClick={() => setDeleteConfirmId(null)}
                    style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: 16, border: "1px solid var(--border-default)", maxWidth: 400, width: "90%", boxShadow: "var(--shadow-xl)", animation: "fadeUp 0.2s ease-out" }}
                    >
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Delete Chat</h3>
                        <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
                            Are you sure you want to delete this chat? This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <button 
                                onClick={() => setDeleteConfirmId(null)}
                                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-2)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmDelete}
                                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-error)", color: "var(--text-1)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuButton = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: (e: React.MouseEvent) => void, danger?: boolean }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px", borderRadius: 6, border: "none", background: "transparent",
        color: danger ? "var(--color-error)" : "var(--text-2)", fontSize: 12, fontWeight: 500,
        cursor: "pointer", transition: "all 0.15s ease", textAlign: "left", width: "100%"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? "var(--color-error-light)" : "var(--bg-card-hover)";
        e.currentTarget.style.color = danger ? "var(--color-error)" : "var(--text-1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "var(--color-error)" : "var(--text-2)";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
