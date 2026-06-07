import { Request, Response } from "express";
import { Quiz, QuizAttempt } from "@/app/models/quiz.models";

export async function getQuizHistoryController(req: Request, res: Response) {
    try {
        const { noteId } = req.query;
        const userId = (req as any).userId || (req.user as any)?._id?.toString() || (req.user as any)?.authData?._id?.toString();

        if (!userId) {
            return res.status(400).json({ success: false, message: "Missing userId" });
        }

        let query: any = { userId };
        if (noteId) {
            query.noteId = noteId;
        }

        const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).lean();
        const quizIds = quizzes.map(q => q._id);

        const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } }).sort({ createdAt: -1 }).lean();

        // Group attempts by quiz
        const history = quizzes.map(quiz => {
            return {
                ...quiz,
                attempts: attempts.filter(a => a.quizId.toString() === quiz._id.toString())
            };
        });

        return res.status(200).json({ success: true, history });
    } catch (error) {
        console.error("Error fetching quiz history", error);
        return res.status(500).json({ success: false, message: "Failed to fetch quiz history" });
    }
}
