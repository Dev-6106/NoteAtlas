import agenda from "@/app/bootstrap/agenda/agenda";
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

  async createNote(noteProps: { title: string; image: string; userId: string },
    imageProps: {generateImagePrompt: string, uploadDir: string, randomName: string}
  ) {
    const note = new Note({
      name: noteProps.title,
      image: noteProps.image,
      userId: noteProps.userId,
    });

    const newNote = await note.save();
    agenda.now("generateImage",{
      noteId: newNote.toObject()._id,
      ...imageProps
    })
    return newNote.toObject();
  }

  async updateNotes(props: {id: string, title: string}){
    const updateNote = await Note.findByIdAndUpdate(props.id,
      {title: props.title}, {new: true, runValidators: true};
      return updateNote;
    )
  }
}
