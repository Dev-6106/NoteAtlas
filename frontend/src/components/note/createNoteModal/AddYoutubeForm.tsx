import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Youtube } from "lucide-react";

import { useAppDispatch } from "@/hooks/useTypedStore";
import { sendYoutubeLink } from "@/api/notes";
import { fetchSingleNote } from "@/store/chatSlice";
import { showError, showSuccess } from "@/util/toast-notification";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  youtubeLink: z
    .string()
    .min(1, "Link is required")
    .url("Please enter a valid URL")
    .refine((url) => {
      try {
        const hostname = new URL(url).hostname;
        return hostname.includes("youtube.com") || hostname.includes("youtu.be");
      } catch {
        return false;
      }
    }, "Must be a valid YouTube URL"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddYoutubeLinkForm({
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
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!noteId) {
      showError("Notebook ID is missing");
      return;
    }

    setLoading(true);
    try {
      await sendYoutubeLink(data.youtubeLink, noteId);
      dispatch(fetchSingleNote(noteId));
      showSuccess("YouTube video successfully added.");
      reset();
      onComplete?.();
    } catch (err) {
      showError("Failed to add YouTube video. Make sure it has captions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1.5">
        <label htmlFor="youtube-link" className="text-sm font-medium text-foreground flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" />
          YouTube URL
        </label>
        <p className="text-xs text-muted-foreground">
          Paste a link to any YouTube video. The AI will extract the transcript.
        </p>
      </div>

      <div className="space-y-2">
        <input
          id="youtube-link"
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring shadow-sm transition-all placeholder:text-muted-foreground"
          {...register("youtubeLink")}
        />
        {errors.youtubeLink && (
          <p className="text-destructive text-xs">{errors.youtubeLink.message}</p>
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