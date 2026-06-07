import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { BaseModal } from "@/components/base/BaseModal";
import { Button } from "@/components/ui/button";
import { generateQuizAction, submitQuizAction, setActiveQuiz, clearAttempt } from "@/store/quizSlice";
import { closeSourceModal, showSourceModalContent } from "@/store/rightPanelSlice";
import { Loader2, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { useParams } from "react-router";

export const QuizModal = ({ noteId }: { noteId?: string }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { sourceModal, docIds } = useSelector((state: RootState) => state.rightPanel);
    const { activeQuiz, generating, submitting, currentAttempt } = useSelector((state: RootState) => state.quiz);

    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
    const [questionCount, setQuestionCount] = useState(5);
    
    // Player state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [startTime, setStartTime] = useState<number>(0);

    const open = sourceModal?.source_type === "quiz-generator" || sourceModal?.source_type === "quiz-player";

    const handleClose = () => {
        dispatch(closeSourceModal());
        dispatch(setActiveQuiz(null));
        setCurrentIndex(0);
        setSelectedAnswers({});
    };

    const handleGenerate = async () => {
        if (!noteId) return;
        if (docIds.length === 0) {
            import("@/util/toast-notification").then(m => m.showError("Please select at least one source."));
            return;
        }
        setStartTime(Date.now());
        await dispatch(generateQuizAction({ noteId, docIds, difficulty, questionCount }));
    };

    const handleSelectOption = (option: string) => {
        setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
    };

    const handleNext = () => {
        if (activeQuiz && currentIndex < activeQuiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        if (!activeQuiz) return;
        
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const answers = Object.keys(selectedAnswers).map(index => ({
            questionIndex: parseInt(index),
            userAnswer: selectedAnswers[parseInt(index)]
        }));

        await dispatch(submitQuizAction({ quizId: activeQuiz._id, answers, timeSpent }));
    };

    // ─── VIEW 1: Generator ───────────────────────────────────────────────
    if (!activeQuiz && !currentAttempt) {
        return (
            <BaseModal open={open} onOpenChange={(val) => !val && handleClose()} title="Generate AI Quiz" width={700} height={550}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "var(--text-1)" }}>
                    <p style={{ color: "var(--text-2)", fontSize: 14 }}>
                        Test your knowledge on the selected sources. Choose your difficulty and length.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 600 }}>Difficulty</label>
                        <div style={{ display: "flex", gap: 12 }}>
                            {["easy", "medium", "hard"].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level as any)}
                                    style={{
                                        flex: 1, padding: "10px", borderRadius: 8, textTransform: "capitalize", fontWeight: 600, fontSize: 14,
                                        background: difficulty === level ? "var(--primary-glow)" : "var(--bg-elevated)",
                                        border: `1px solid ${difficulty === level ? "var(--primary-brand)" : "var(--border-default)"}`,
                                        color: difficulty === level ? "var(--primary-brand)" : "var(--text-2)",
                                        cursor: "pointer", transition: "all 0.2s"
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 600 }}>Number of Questions ({questionCount})</label>
                        <input 
                            type="range" min={3} max={15} step={1} value={questionCount} 
                            onChange={e => setQuestionCount(parseInt(e.target.value))}
                            style={{ accentColor: "var(--primary-brand)" }}
                        />
                    </div>

                    <Button onClick={handleGenerate} disabled={generating} style={{ marginTop: 24, padding: "24px 0", fontSize: 16, borderRadius: 12 }}>
                        {generating ? <><Loader2 className="spin" size={20} style={{marginRight: 10}}/> Generating Quiz...</> : "Generate AI Quiz"}
                    </Button>
                </div>
            </BaseModal>
        );
    }

    // ─── VIEW 2: Results ─────────────────────────────────────────────────
    if (currentAttempt && activeQuiz) {
        return (
            <BaseModal open={open} onOpenChange={(val) => !val && handleClose()} title="Quiz Results" width={800} height={750}>
                <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "var(--text-1)" }}>
                    
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, background: "var(--primary-glow)", borderRadius: 16, border: "1px solid var(--border-accent)" }}>
                        <Trophy size={48} style={{ color: "var(--primary-brand)", marginBottom: 12 }} />
                        <h2 style={{ fontSize: 32, fontWeight: 800 }}>{currentAttempt.score} / {currentAttempt.totalQuestions}</h2>
                        <p style={{ color: "var(--text-2)" }}>Time spent: {currentAttempt.timeSpent}s</p>
                    </div>

                    <div className="studio-scroll" style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto" }}>
                        {activeQuiz.questions.map((q, idx) => {
                            const ans = currentAttempt.answers.find(a => a.questionIndex === idx);
                            const isCorrect = ans?.isCorrect;
                            
                            return (
                                <div key={idx} style={{ padding: 16, background: "var(--bg-elevated)", borderRadius: 12, border: "1px solid var(--border-default)" }}>
                                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                        {isCorrect ? <CheckCircle2 color="var(--color-success)" /> : <XCircle color="var(--color-error)" />}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{idx + 1}. {q.questionText}</p>
                                            
                                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                                                {q.options.map((opt, oIdx) => {
                                                    let bg = "var(--bg-card)";
                                                    let border = "var(--border-default)";
                                                    if (opt === q.correctAnswer) {
                                                        bg = "var(--color-success-light)";
                                                        border = "var(--color-success)";
                                                    } else if (ans?.userAnswer === opt && !isCorrect) {
                                                        bg = "var(--color-error-light)";
                                                        border = "var(--color-error)";
                                                    }
                                                    return (
                                                        <div key={oIdx} style={{ padding: "8px 12px", borderRadius: 6, background: bg, border: `1px solid ${border}`, fontSize: 14 }}>
                                                            {opt}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 8, borderLeft: "3px solid var(--primary-brand)", fontSize: 13, color: "var(--text-2)" }}>
                                                <strong>Explanation:</strong> {q.explanation}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                        <Button variant="outline" onClick={handleClose}>Close</Button>
                        <Button variant="secondary" onClick={() => { dispatch(clearAttempt()); setCurrentIndex(0); setSelectedAnswers({}); dispatch(setActiveQuiz(activeQuiz)); }}>Retake Quiz</Button>
                        <Button onClick={() => { dispatch(clearAttempt()); dispatch(setActiveQuiz(null)); setCurrentIndex(0); setSelectedAnswers({}); dispatch(closeSourceModal()); dispatch(showSourceModalContent({ source_type: "quiz-generator", content: "" })); }}>New Quiz</Button>
                    </div>
                </div>
            </BaseModal>
        );
    }

    // ─── VIEW 3: Player ──────────────────────────────────────────────────
    if (activeQuiz) {
        const question = activeQuiz.questions[currentIndex];
        const isLast = currentIndex === activeQuiz.questions.length - 1;
        const currentAnswer = selectedAnswers[currentIndex];

        return (
            <BaseModal open={open} onOpenChange={(val) => !val && handleClose()} title={`Question ${currentIndex + 1} of ${activeQuiz.questions.length}`} width={800} height={650}>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", color: "var(--text-1)" }}>
                    
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                        <h3 style={{ fontSize: 18, lineHeight: 1.5, fontWeight: 600 }}>{question.questionText}</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {question.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(opt)}
                                    style={{
                                        padding: "16px 20px", borderRadius: 12, textAlign: "left", fontSize: 15, cursor: "pointer", transition: "all 0.2s",
                                        background: currentAnswer === opt ? "var(--primary-glow)" : "var(--bg-elevated)",
                                        border: `2px solid ${currentAnswer === opt ? "var(--primary-brand)" : "var(--border-default)"}`,
                                        color: currentAnswer === opt ? "var(--primary-brand)" : "var(--text-1)",
                                    }}
                                    onMouseEnter={e => { if (currentAnswer !== opt) e.currentTarget.style.borderColor = "var(--border-accent)" }}
                                    onMouseLeave={e => { if (currentAnswer !== opt) e.currentTarget.style.borderColor = "var(--border-default)" }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid var(--border-default)", marginTop: 20 }}>
                        <Button variant="ghost" onClick={handleClose}>Exit Quiz</Button>
                        {isLast ? (
                            <Button disabled={!currentAnswer || submitting} onClick={handleSubmit}>
                                {submitting ? <><Loader2 className="spin" size={16} style={{marginRight: 8}}/> Submitting...</> : "Submit Quiz"}
                            </Button>
                        ) : (
                            <Button disabled={!currentAnswer} onClick={handleNext}>Next Question</Button>
                        )}
                    </div>
                </div>
            </BaseModal>
        );
    }

    return null;
};
