import { Label } from "@/components/ui/label";
import { Loader2, MoveLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendTextData } from "@/api/notes";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchSingleNote } from "@/store/chatSlice";

const pasteTextSchema = z.object({
    text: z
        .string()
        .min(50, "Text must be at least 50 characters")
        .max(5000, "Text is too long"),
});

type PasteTextFormValues = z.infer<typeof pasteTextSchema>;

export const AddPasteTextForm = ({ hidePasteTextForm, noteId }: { hidePasteTextForm: () => void, noteId?: string }) => {

    const dispatch = useDispatch<AppDispatch>();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<PasteTextFormValues>({
        resolver: zodResolver(pasteTextSchema),
    });

    const onSubmit = async (data: PasteTextFormValues) => {
        await sendTextData(data?.text, noteId);
        dispatch(fetchSingleNote(noteId as string));
        reset();
        console.log("✅ Submitted Paste Text:", data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 4, marginBottom: 16, marginTop: 16 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button
                    type="button"
                    onClick={hidePasteTextForm}
                    style={{
                        background: "none", border: "none",
                        color: "var(--text-3)", cursor: "pointer",
                        display: "flex", alignItems: "center",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-1)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
                    }}
                >
                    <MoveLeft size={18} />
                </button>
                <label style={{
                    fontSize: 14, fontWeight: 600, color: "var(--text-1)",
                }}>
                    Paste a Text
                </label>
            </div>

            <textarea
                id="text"
                {...register("text")}
                placeholder="Paste text here"
                style={{
                    width: "100%",
                    minHeight: 100,
                    resize: "vertical",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-2)",
                    fontSize: 14,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    outline: "none",
                    transition: "all 0.2s",
                    marginTop: 4,
                }}
                onFocus={e => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                    e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                    e.currentTarget.style.boxShadow = "0 0 16px rgba(99,102,241,0.1)";
                }}
                onBlur={e => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.background = "var(--bg-surface)";
                    e.currentTarget.style.boxShadow = "none";
                }}
            />
            {errors.text && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {errors.text.message}
                </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "9px 20px", borderRadius: 10,
                        background: isSubmitting
                            ? "var(--primary-glow)"
                            : "linear-gradient(135deg, var(--primary-brand), var(--primary-light))",
                        color: "var(--text-on-primary)", fontSize: 13, fontWeight: 700,
                        border: "none",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        boxShadow: isSubmitting ? "none" : "var(--shadow-primary)",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                        if (!isSubmitting) {
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)";
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)";
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                            Submitting...
                        </>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </form>
    );
};
