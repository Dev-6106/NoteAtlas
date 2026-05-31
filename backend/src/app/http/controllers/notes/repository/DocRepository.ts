import { Doc } from "@/app/models/doc.models";
import { Types } from "mongoose";
import { NotFoundError } from "@/middleware/error.middleware";
import { Note } from "@/app/models/note.models";

type DocFieldUpdate = {
  userId: string;
  noteId: string;
};

export class DocRepository {
  private static instance: DocRepository;

  public static getInstance(): DocRepository {
    if (!DocRepository.instance) {
      DocRepository.instance = new DocRepository();
    }
    return DocRepository.instance;
  }

  async createDoc(docProps: {
    fileName: string;
    title: string;
    userId: string;
    noteId: Types.ObjectId;
  }) {
    const doc = new Doc({ ...docProps });
    const newDoc = await doc.save();
    await Note.findByIdAndUpdate(docProps.noteId, { $push: { docs: newDoc._id } });
    return newDoc.toObject();
  }

  /**
   * Generic field updater that DRYs up the 5 near-identical update methods.
   */
  private async updateField(
    filter: DocFieldUpdate,
    update: Record<string, any>,
    fieldName: string
  ) {
    const result = await Doc.findOneAndUpdate(
      { userId: filter.userId, noteId: filter.noteId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!result) {
      throw new NotFoundError(
        `Document not found for ${fieldName} update`
      );
    }

    return result;
  }

  async updateSummary2(props: { docId: any, userId: any, noteId: any, summary: any }) {
    const { userId, noteId, docId } = props;
    const row = await Doc.findOneAndUpdate({_id: docId, userId, noteId},{
      $set: {summary: props.summary}
    },{new: true,runValidators: true})
    if(!row) throw new Error("No doc found");
    return row;
  }

  async updateFaq2(props: { docId: any, userId: any, noteId: any, faq: any }) {
    const { userId, noteId, docId } = props;
    const row = await Doc.findOneAndUpdate({_id: docId, userId, noteId},{
      $set: {FAQ: props.faq}
    },{new: true,runValidators: true})
    if(!row) throw new Error("No doc found");
    return row;
  }

  async updateStudyGuide2(props: { docId: any, userId: any, noteId: any, studyGuide: any }) {
    const { userId, noteId, docId } = props;
    const row = await Doc.findOneAndUpdate({_id: docId, userId, noteId},{
      $set: {studyGuide: props.studyGuide}
    },{new: true,runValidators: true})
    if(!row) throw new Error("No doc found");
    return row;
  }

  async updateBriefingDoc2(props: { docId: any, userId: any, noteId: any, briefingDoc: any }) {
    const { userId, noteId, docId } = props;
    const row = await Doc.findOneAndUpdate({_id: docId, userId, noteId},{
      $set: {briefingDoc: props.briefingDoc}
    },{new: true,runValidators: true})
    if(!row) throw new Error("No doc found");
    return row;
  }

  async updateSummary(props: DocFieldUpdate & { summary: string }) {
    return this.updateField(props, { summary: props.summary }, "summary");
  }

  async updateBriefingDoc(props: DocFieldUpdate & { briefingDoc: string }) {
    return this.updateField(
      props,
      { briefingDoc: props.briefingDoc },
      "briefingDoc"
    );
  }

  async updateFaq(props: DocFieldUpdate & { faq: string }) {
    return this.updateField(props, { FAQ: props.faq }, "FAQ");
  }

  async updateStudyGuide(props: DocFieldUpdate & { studyGuide: string }) {
    return this.updateField(
      props,
      { studyGuide: props.studyGuide },
      "studyGuide"
    );
  }

  async updateMindMap(props: DocFieldUpdate & { mindMap: string }) {
    return this.updateField(props, { mindMap: props.mindMap }, "mindMap");
  }

  async updateMindMap2(props: { docId: any, userId: any, noteId: any, mindMap: any }) {
    const { userId, noteId, docId } = props;
    const row = await Doc.findOneAndUpdate({_id: docId, userId, noteId},{
      $set: {mindMap: props.mindMap}
    },{new: true,runValidators: true})
    if(!row) throw new Error("No doc found");
    return row;
  }

  async updateAudioOverview2(props: { docId: any, userId: any, noteId: any, audioOverview: any }) {
    const { userId, noteId, docId } = props;
    const row = await Doc.findOneAndUpdate({_id: docId, userId, noteId},{
      $set: {audioOverview: props.audioOverview}
    },{new: true,runValidators: true})
    if(!row) throw new Error("No doc found");
    return row;
  }

  async updateAudioOverview(props: DocFieldUpdate & { audioOverview: string }) {
    return this.updateField(props, { audioOverview: props.audioOverview }, "audioOverview");
  }

  async getSingleDoc(props: { userId: string; noteId: string }) {
    return Doc.findOne(props).lean();
  }

  async getSingleDoc2(props: { _id: string, userId: string, noteId: string }) {
    return Doc.findOne(props).lean();
  }

  async getDocsByNoteId(noteId: string) {
    return Doc.find({ noteId }).lean();
  }

  async getDocsByIds(props: { docIds: string[]; userId: string; noteId: string }) {
    return Doc.find({
      _id: { $in: props.docIds },
      userId: props.userId,
      noteId: props.noteId,
    }).lean();
  }
}