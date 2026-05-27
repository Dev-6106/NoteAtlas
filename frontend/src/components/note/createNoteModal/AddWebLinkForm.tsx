import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Link as LinkIcon } from "lucide-react";

import { useAppDispatch } from "@/hooks/useTypedStore";
import { sendWeblink } from "@/api/notes";
import { fetchSingleNote } from "@/store/chatSlice";
import { showError, showSuccess } from "@/util/toast-notification";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  weblink: z
    .string()
    .min(1, "Link is required")
    .url("Please enter a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddWebLinkForm({
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
      await sendWeblink(data.weblink, noteId);
      dispatch(fetchSingleNote(noteId));
      showSuccess("Web page successfully extracted and added.");
      reset();
      onComplete?.();
    } catch (err) {
      showError("Failed to extract web page. Make sure the link is publicly accessible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="space-y-1.5">
        <label htmlFor="web-link" className="text-sm font-medium text-foreground flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-green-500" />
          Website URL
        </label>
        <p className="text-xs text-muted-foreground">
          Paste a link to any public article, documentation, or blog post.
        </p>
      </div>

      <div className="space-y-2">
        <input
          id="web-link"
          type="text"
          placeholder="https://example.com/article"
          className="w-full px-3 py-2.5 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring shadow-sm transition-all placeholder:text-muted-foreground"
          {...register("weblink")}
        />
        {errors.weblink && (
          <p className="text-destructive text-xs">{errors.weblink.message}</p>
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