import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { updateNote } from "@/api/notes";
import { useEffect } from "react";

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
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EditNoteFormValues>({
    resolver: zodResolver(editNoteSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (note?.title) {
      setValue("title", note.title);
    }
  }, [note, setValue]);

  const handleBlur = async () => {
    const data = getValues();
    if (!errors.title && note?._id) {
      await updateNote(note._id, data.title);
    }
  };

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <Input
        id="note-title"
        {...register("title")}
        onBlur={handleBlur}
        className="border-none h-9 w-full max-w-sm text-base font-semibold focus:ring-0 focus-visible:ring-0 focus:border-0 outline-none bg-transparent placeholder:text-muted-foreground"
        aria-label="Notebook title"
      />
      {errors.title && (
        <p className="text-xs text-destructive shrink-0">{errors.title.message}</p>
      )}
    </div>
  );
};
