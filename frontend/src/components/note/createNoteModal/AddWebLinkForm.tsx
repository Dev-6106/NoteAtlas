import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Loader2, MoveLeft } from "lucide-react";

import { sendWeblink } from "@/api/notes";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { fetchSingleNote } from "@/store/chatSlice";

// 1. Schema validation with Zod
const formSchema = z.object({
    weblink: z
        .string()
        .min(1, "Link is required")
        .url("Please enter a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

const AddWebLinkForm = ({ hideWebLinkForm, noteId }: { hideWebLinkForm: () => void, noteId?: string }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    // 3. Submission handler
    const onSubmit = async (data: FormValues) => {
        await sendWeblink(data?.weblink, noteId);
        dispatch(fetchSingleNote(noteId as string));
        reset();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 4, marginBottom: 16, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <button
                    type="button"
                    onClick={hideWebLinkForm}
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
                    Paste a link
                </label>
            </div>

            <textarea
                id="link"
                placeholder="https://www.npmjs.com/package/react-google-drive-picker"
                {...register("weblink")}
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

            {errors.weblink && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    {errors.weblink.message}
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

export default AddWebLinkForm;