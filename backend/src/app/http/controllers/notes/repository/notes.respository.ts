import { Note } from "@/app/models/note.models";

export class NoteRepository {
  private static instance: NoteRepository;

  //singleton design pattern
  public static getInstance(): NoteRepository {
    if (!NoteRepository.instance) {
      NoteRepository.instance = new NoteRepository();
    }
    return NoteRepository.instance;
  }

  async createNote(props: { name: string; image: string; userId: string }) {
    const note = new Note({
      ...props,
    });

    const newNote = await note.save();
    return newNote.toObject();
  }
}
