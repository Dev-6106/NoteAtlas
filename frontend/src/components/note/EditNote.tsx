import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoveLeft, Loader2, } from "lucide-react";

import { Link } from "react-router";
import { updateNote } from "@/api/notes";
import { useEffect } from "react";

// Schema validation with Zod
const editNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

type EditNoteFormValues = z.infer<typeof editNoteSchema>;
interface EditNoteProps {
  note?: { _id: string; title: string };
}

export const EditNote = ({ note }: EditNoteProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EditNoteFormValues>({
    resolver: zodResolver(editNoteSchema),
    defaultValues: {
      title: "",
    },
  });



  // 🧠 When note data changes (e.g., from API), update the form value
  useEffect(() => {
    if (note?.title) {
      setValue("title", note.title)
    }
  }, [note, setValue])


  // Submit only on blur
  const handleBlur = async () => {
    const data = getValues();
    if (!errors.title) {
      await updateNote(note?._id as string, data?.title)
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between", marginBottom: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <Link
          to="/notes"
          style={{
            width: 30, height: 30, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--primary-mid)",
            border: "1px solid var(--border-strong)",
            color: "var(--text-3)", textDecoration: "none",
            transition: "all 0.2s", flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.12)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.35)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-1)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--primary-mid)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-strong)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-3)";
          }}
        >
          <MoveLeft size={15} />
        </Link>
        <div style={{ flex: 1 }}>
          <input
            id="title"
            {...register("title")}
            onBlur={handleBlur}
            style={{
              width: 400,
              height: 42,
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-1)",
              letterSpacing: "-0.3px",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'DM Sans', system-ui, sans-serif",
              padding: "4px 8px",
            }}
          />

          {errors.title && (
            <p style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>
              {errors.title.message}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginRight: 16 }}>
        {/* header actions, e.g., user avatar */}
      </div>
    </div>
  );
};
