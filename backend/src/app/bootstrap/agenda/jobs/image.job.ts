import agenda from "../agenda";

import { generateImage } from "@/app/http/controllers/notes/helpers/generateImage";
import { NoteRepository } from "@/app/http/controllers/notes/repository/notes.repository";
import { getPresignedUrl } from "@/services/storage/presigned.service";

agenda.define(
  "generateImage",

  async (job: any) => {

    const {
      noteId,
      generateImagePrompt,
    } = job.attrs.data as any;

    console.log(
      "Starting image generation for Note",
      noteId,
    );

    await generateImage(
      generateImagePrompt,
      noteId,
      async (storageKey: string) => {
        console.log(
          "Finished generating the image...", storageKey
        );
        // We could just save the storage key or get a presigned URL immediately. 
        // For simplicity, let's get a presigned URL valid for a long time.
        const url = await getPresignedUrl(storageKey, 604800);
        
        await NoteRepository.getInstance().updateNotes({ id: noteId, title: undefined as any, image: url });
      },
    );
  },
);