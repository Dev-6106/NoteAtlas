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

  async getSingleNote(noteId:string){
    const note = await Note.findById(noteId)
                  .populate("docs")
                  .lean();
    return note;
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

  async updateNotes(props: { id: string; title?: string; image?: string; description?: string; isArchived?: boolean; isPinned?: boolean }) {
    const updateData: any = {};
    if (props.title !== undefined) updateData.title = props.title;
    if (props.image !== undefined) updateData.image = props.image;
    if (props.description !== undefined) updateData.description = props.description;
    if (props.isArchived !== undefined) {
      updateData.isArchived = props.isArchived;
      updateData.archivedAt = props.isArchived ? new Date() : null;
    }
    if (props.isPinned !== undefined) updateData.isPinned = props.isPinned;

    const updatedNote = await Note.findByIdAndUpdate(
      props.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
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
    sortBy = "updatedAt",
    sortOrder = "desc",
    isArchived = false,
  }: {
    search?: string;
    page?: number;
    limit?: number;
    userId?: string;
    sortBy?: string;
    sortOrder?: string;
    isArchived?: boolean;
  }) {
    const query: Record<string, any> = { isArchived: isArchived ? true : { $ne: true } };

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

    // Handle sorting logic
    const sortParams: Record<string, 1 | -1> = {};
    const order = sortOrder === "asc" ? 1 : -1;
    
    // Always pin pinned notes first if we aren't explicitly sorting by something else
    if (sortBy === "updatedAt" || sortBy === "createdAt") {
        sortParams.isPinned = -1; // true (1) before false (0)
    }
    
    if (sortBy === "title") sortParams.title = order;
    else if (sortBy === "createdAt") sortParams.createdAt = order;
    else sortParams.updatedAt = order; // default

    const [notes, total] = await Promise.all([
      Note.find(query)
        .skip(skip)
        .limit(limit)
        .sort(sortParams)
        .populate("docs")
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
