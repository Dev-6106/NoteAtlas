import { Source } from "@/app/models/source.models";

export class SourceRepository {
  private static instance: SourceRepository;

  public static getInstance(): SourceRepository {
    if (!SourceRepository.instance) {
      SourceRepository.instance =
        new SourceRepository();
    }

    return SourceRepository.instance;
  }

  async createSource(props: {
    source_type: string;
    userId: string;
    title: string;
    noteId: string;
    total_source: number;
    content: string;
  }) {
    const source = new Source({
      ...props,
    });

    const newSource = await source.save();

    return newSource.toObject();
  }

  async getAllSources (props: {noteId: string, userId: string}){
    const sources = await Source.find({...props});
    return sources;
  }
}