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
                        color: "#64748b", cursor: "pointer",
                        display: "flex", alignItems: "center",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                    }}
                >
                    <MoveLeft size={18} />
                </button>
                <label style={{
                    fontSize: 14, fontWeight: 600, color: "#f1f5f9",
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
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e2e8f0",
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
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
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
                            ? "rgba(99,102,241,0.3)"
                            : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color: "#fff", fontSize: 13, fontWeight: 700,
                        border: "none",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        boxShadow: isSubmitting ? "none" : "0 4px 16px rgba(99,102,241,0.35)",
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
