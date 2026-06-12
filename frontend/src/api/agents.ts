import { makeHttpReq } from "@/helper/makeHttpReq";
import { getUserData } from "@/helper/getUserData";

export const generateAgentReport = async (noteId: string, docIds: string[], agentType: string, inputs: string) => {
    const userData = getUserData();
    const userId = userData?._id;

    if (!userId) {
        throw new Error("User not authenticated");
    }

    const data = await makeHttpReq('POST', `notes/agents/generate`, {
        userId,
        noteId,
        docIds,
        agentType,
        inputs
    });

    return data;
};
