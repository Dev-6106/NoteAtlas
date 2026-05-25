import agenda from "@/app/bootstrap/agenda/agenda";
import { Doc } from "@/app/models/doc.models";
import { Types } from "mongoose";

export class DocRepository {

  private static instance: DocRepository;

  // Singleton
  public static getInstance(): DocRepository {

    if (!DocRepository.instance) {
      DocRepository.instance =
        new DocRepository();
    }

    return DocRepository.instance;
  }

  async createDoc(docProps: { fileName: string; title: string; userId: string; noteId: Types.ObjectId;})
  {
    const doc = new Doc({
      ...docProps
    });
    const newDoc = await doc.save();
    return newDoc.toObject();
  };

  async updateSummary(props: {userId: string, noteId: string, summary: string}){
    const {userId, noteId} = props;
    const updateSummary = await Doc.findOneAndUpdate({userId,noteId}, {
        $set: {summary: props.summary}
    },{new: true, runValidators: true});
    
    if(!updateSummary) throw new Error("No doc found");
    return updateSummary;
  }

  async updateBriefingDoc(props: {userId: string, noteId: string, briefingDoc: string}){
    const {userId, noteId} = props;
    const updatebriefingDoc = await Doc.findOneAndUpdate({userId,noteId}, {
        $set: {briefingDoc: props.briefingDoc}
    },{new: true, runValidators: true});
    
    if(!updatebriefingDoc) throw new Error("No doc found");
    return updatebriefingDoc;
  }

  async updateFaq(props: {userId: string, noteId: string, faq: string}){
    const {userId, noteId} = props;
    const updateFaq = await Doc.findOneAndUpdate({userId,noteId}, {
        $set: {faq: props.faq}
    },{new: true, runValidators: true});
    
    if(!updateFaq) throw new Error("No doc found");
    return updateFaq;
  }

  async updateStudyGuide(props: {userId: string, noteId: string, studyGuide: string}){
    const {userId, noteId} = props;
    const updateStudyGuide = await Doc.findOneAndUpdate({userId,noteId}, {
        $set: {studyGuide: props.studyGuide}
    },{new: true, runValidators: true});
    
    if(!updateStudyGuide) throw new Error("No doc found");
    return updateStudyGuide;
  }

  async updateMindMap(props: {userId: string, noteId: string, mindMap: string}){
    const {userId, noteId} = props;
    const updatemindMap = await Doc.findOneAndUpdate({userId,noteId}, {
        $set: {mindMap: props.mindMap}
    },{new: true, runValidators: true});
    
    if(!updatemindMap) throw new Error("No doc found");
    return updatemindMap;
  }

  async getSingleDoc(props: { userId: string, noteId: string}){
    const doc = await Doc.findOne({...props});
    return doc
  }
}