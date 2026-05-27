import agenda from "@/app/bootstrap/agenda/agenda";
import { Note } from "@/app/models/note.models";
import { NotFoundError } from "@/middleware/error.middleware";

export class NoteRepository {
  private static instance: NoteRepository;

  public static getInstance(): NoteRepository {
    if (!NoteRepository.instance) {
      NoteRepository.instance = new NoteRepository();
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
      randomName: string;
    }
  ) {
    const note = new Note({
      title: noteProps.title,
      image: noteProps.image,
      userId: noteProps.userId,
    });

    const newNote = await note.save();

    await agenda.now("generateImage", {
      noteId: newNote._id.toString(),
      ...imageProps,
    });

    return newNote.toObject();
  }

  async createBlankNote(userId: string) {
    const note = new Note({
      title: "Untitled notebook",
      image: "📓",
      userId,
    });

    const newNote = await note.save();
    return newNote.toObject();
  }

  async updateNotes(props: { id: string; title: string }) {
    const updatedNote = await Note.findByIdAndUpdate(
      props.id,
      { title: props.title },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      throw new NotFoundError("Note not found");
    }

    return updatedNote;
  }

  async getAllNotes({
    search = "",
    page = 1,
    limit = 10,
    userId,
  }: {
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    const query: Record<string, any> = {};

    // Filter by user
    if (userId) {
      query.userId = userId;
    }

    // Sanitize search regex to prevent ReDoS
    if (search) {
      const sanitized = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.title = { $regex: sanitized, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Note.countDocuments(query),
    ]);

    return {
      notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const note = await Note.findById(id).lean();
    if (!note) {
      throw new NotFoundError("Note not found");
    }
    return note;
  }

  async deleteNote(id: string) {
    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError("Note not found");
    }
    return deleted;
  }
}
