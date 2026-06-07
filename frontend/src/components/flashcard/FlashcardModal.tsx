import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { BaseModal } from "@/components/base/BaseModal";
import { Button } from "@/components/ui/button";
import { generateFlashcardAction, setActiveFlashcardSet } from "@/store/flashcardSlice";
import { closeSourceModal, showSourceModalContent } from "@/store/rightPanelSlice";
import { Loader2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import "./Flashcard.css";

export const FlashcardModal = ({ noteId }: { noteId?: string }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { sourceModal, docIds } = useSelector((state: RootState) => state.rightPanel);
    const { activeFlashcardSet, generating } = useSelector((state: RootState) => state.flashcard);

    const [count, setCount] = useState(10);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const open = sourceModal?.source_type === "flashcard-generator" || sourceModal?.source_type === "flashcard-player";

    const handleClose = () => {
        dispatch(closeSourceModal());
        dispatch(setActiveFlashcardSet(null));
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleGenerate = async () => {
        if (!noteId) return;
        if (docIds.length === 0) {
            import("@/util/toast-notification").then(m => m.showError("Please select at least one source."));
            return;
        }
        await dispatch(generateFlashcardAction({ noteId, docIds, count }));
    };

    const handleNext = () => {
        if (activeFlashcardSet && currentIndex < activeFlashcardSet.cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    };

    const handlePrev = () => {
        if (activeFlashcardSet && currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    };

    // ─── VIEW 1: Generator ───────────────────────────────────────────────
    if (!activeFlashcardSet) {
        return (
            <BaseModal open={open} onOpenChange={(val) => !val && handleClose()} title="Generate AI Flashcards" width={500} height={350}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "var(--text-1)" }}>
                    <p style={{ color: "var(--text-2)", fontSize: 14 }}>
                        Create interactive flashcards from your selected sources to study key concepts.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 600 }}>Number of Flashcards ({count})</label>
                        <input 
                            type="range" min={5} max={25} step={1} value={count} 
                            onChange={e => setCount(parseInt(e.target.value))}
                            style={{ accentColor: "var(--primary-brand)" }}
                        />
                    </div>

                    <Button onClick={handleGenerate} disabled={generating} style={{ marginTop: 24, padding: "24px 0", fontSize: 16, borderRadius: 12 }}>
                        {generating ? <><Loader2 className="spin" size={20} style={{marginRight: 10}}/> Generating Flashcards...</> : "Generate AI Flashcards"}
                    </Button>
                </div>
            </BaseModal>
        );
    }

    // ─── VIEW 2: Player ──────────────────────────────────────────────────
    if (activeFlashcardSet) {
        const card = activeFlashcardSet.cards[currentIndex];
        
        return (
            <BaseModal open={open} onOpenChange={(val) => !val && handleClose()} title={activeFlashcardSet.title || "Study Flashcards"} width={700} height={500}>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--text-1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <span style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 600 }}>Card {currentIndex + 1} of {activeFlashcardSet.cards.length}</span>
                        <Button variant="ghost" size="icon" onClick={() => setIsFlipped(!isFlipped)} title="Flip Card">
                            <RotateCw size={18} />
                        </Button>
                    </div>

                    <div className="flashcard-scene" style={{ flex: 1, perspective: "1000px", marginBottom: 24 }}>
                        <div 
                            className={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}
                            onClick={() => setIsFlipped(!isFlipped)}
                            style={{ 
                                width: "100%", height: "100%", position: "relative", transition: "transform 0.6s", transformStyle: "preserve-3d", cursor: "pointer" 
                            }}
                        >
                            {/* Front */}
                            <div className="flashcard-face flashcard-front" style={{
                                position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center",
                                background: "var(--bg-elevated)", borderRadius: 16, border: "2px solid var(--border-default)",
                                boxShadow: "var(--shadow-sm)"
                            }}>
                                <h3 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{card.front}</h3>
                                <span style={{ position: "absolute", bottom: 16, fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Click to flip</span>
                            </div>

                            {/* Back */}
                            <div className="flashcard-face flashcard-back" style={{
                                position: "absolute", width: "100%", height: "100%", backfaceVisibility: "hidden",
                                display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center",
                                background: "var(--primary-glow)", borderRadius: 16, border: "2px solid var(--primary-brand)",
                                transform: "rotateY(180deg)", boxShadow: "var(--shadow-primary)"
                            }}>
                                <p style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.6, color: "var(--text-1)" }}>{card.back}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Button variant="outline" disabled={currentIndex === 0} onClick={handlePrev} style={{ width: 120 }}>
                            <ChevronLeft size={18} style={{ marginRight: 6 }} /> Previous
                        </Button>
                        <Button variant="outline" disabled={currentIndex === activeFlashcardSet.cards.length - 1} onClick={handleNext} style={{ width: 120 }}>
                            Next <ChevronRight size={18} style={{ marginLeft: 6 }} />
                        </Button>
                    </div>
                </div>
            </BaseModal>
        );
    }

    return null;
};
