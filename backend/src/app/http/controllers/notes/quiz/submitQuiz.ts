import { Request, Response } from "express";
import { Quiz, QuizAttempt } from "@/app/models/quiz.models";

export async function submitQuizController(req: Request, res: Response) {
    try {
        const { quizId, answers, timeSpent } = req.body;
        const userId = (req as any).userId || (req.user as any)?._id?.toString();

        if (!userId || !quizId || !answers) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        let correctCount = 0;
        const processedAnswers = answers.map((ans: any) => {
            const question = quiz.questions[ans.questionIndex];
            if (!question) return { ...ans, isCorrect: false };
            
            const isCorrect = question.correctAnswer === ans.userAnswer;
            if (isCorrect) correctCount++;
            
            return {
                questionIndex: ans.questionIndex,
                userAnswer: ans.userAnswer,
                isCorrect
            };
        });

        const attempt = await QuizAttempt.create({
            userId,
            quizId,
            score: correctCount,
            totalQuestions: quiz.questions.length,
            answers: processedAnswers,
            timeSpent: timeSpent || 0
        });

        return res.status(200).json({ 
            success: true, 
            attempt,
            quiz // return quiz so client can see explanations
        });
    } catch (error) {
        console.error("Error submitting quiz", error);
        return res.status(500).json({ success: false, message: "Failed to submit quiz" });
    }
}
