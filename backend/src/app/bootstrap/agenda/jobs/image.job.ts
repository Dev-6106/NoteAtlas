import agenda from "../agenda";

import { generateImage } from "@/app/http/controllers/notes/helpers/generateImage";

agenda.define(
  "generateImage",

  async (job: any) => {

    const {
      noteId,
      generateImagePrompt,
      uploadDir,
      randomName,
    } = job.attrs.data as any;

    console.log(
      "Starting image generation for Note",
      noteId,
    );

    await generateImage(
      generateImagePrompt,
      uploadDir,
      randomName,

      async (fileName: string) => {

        console.log(
          "Finished generating the image...",
        );

      },
    );
  },
);