import agenda from "@/app/bootstrap/agenda/agenda";
import { Note } from "@/app/models/note.models";

export class NoteRepository {

  private static instance: NoteRepository;

  // Singleton
  public static getInstance(): NoteRepository {

    if (!NoteRepository.instance) {
      NoteRepository.instance =
        new NoteRepository();
    }

    return NoteRepository.instance;
  }

  async createNote(

    noteProps: {
      title: string;
      image: string;
      userId: string;
    },

    imageProps: {
      generateImagePrompt: string;
      uploadDir: string;
      randomName: string
    }

  ) {

    const note = new Note({
      title: noteProps.title,
      image: noteProps.image,
      userId: noteProps.userId,
    });

    const newNote = await note.save();

    await agenda.now(
      "generateImage",
      {
        noteId: newNote._id.toString(),
        ...imageProps,
      },
    );

    return newNote.toObject();
  }

  async updateNotes(
    props: {
      id: string;
      title: string;
    },
  ) {

    const updatedNote =
      await Note.findByIdAndUpdate(

        props.id,

        {
          title: props.title,
        },

        {
          new: true,
          runValidators: true,
        },
      );

    return updatedNote;
  };

  async getAllNotes({
    search = "",
    page = 1,
    limit = 10,
  }: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const skip = (page - 1) * limit;

    const notes = await Note.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await Note.countDocuments(query);

    return {
      notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
}