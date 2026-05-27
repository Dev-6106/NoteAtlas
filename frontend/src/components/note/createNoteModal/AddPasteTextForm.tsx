import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Type } from "lucide-react";

import { useAppDispatch } from "@/hooks/useTypedStore";
import { sendTextData } from "@/api/notes";
import { fetchSingleNote } from "@/store/chatSlice";
import { showError, showSuccess } from "@/util/toast-notification";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const pasteTextSchema = z.object({
  text: z
    .string()
    .min(50, "Text must be at least 50 characters for AI to extract meaningful context.")
    .max(50000, "Text is too long. Please paste a shorter excerpt."),
});

type PasteTextFormValues = z.infer<typeof pasteTextSchema>;

export default function AddPasteTextForm({
  onComplete,
  noteId,
}: {
  onComplete?: () => void;
  noteId?: string;
}) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasteTextFormValues>({
    resolver: zodResolver(pasteTextSchema),
  });

  const onSubmit = async (data: PasteTextFormValues) => {
    if (!noteId) {
      showError("Notebook ID is missing");
      return;
    }

    setLoading(true);
    try {
      await sendTextData(data.text, noteId);
      dispatch(fetchSingleNote(noteId));
      showSuccess("Text successfully added to notebook.");
      reset();
      onComplete?.();
    } catch (err) {
      showError("Failed to add text source. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1.5">
        <label htmlFor="pasted-text" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Type className="w-4 h-4 text-foreground" />
          Copied Text
        </label>
        <p className="text-xs text-muted-foreground">
          Paste any text directly into the notebook. Good for quick notes, code snippets, or short articles.
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          id="pasted-text"
          {...register("text")}
          className="resize-none min-h-[160px] bg-background border-border/60 focus:border-primary/50 text-sm custom-scrollbar"
          placeholder="Paste your text here..."
        />
        {errors.text && (
          <p className="text-destructive text-xs">{errors.text.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {loading ? "Processing..." : "Add Source"}
        </Button>
      </div>
    </form>
  );
}
