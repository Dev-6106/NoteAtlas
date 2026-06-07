import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { makeHttpReq } from '@/helper/makeHttpReq';
import { showError } from '@/util/toast-notification';

// Helper to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Helper to shuffle a quiz's questions and options
function shuffleQuiz(quiz: Quiz | null): Quiz | null {
  if (!quiz) return null;
  return {
    ...quiz,
    questions: shuffleArray(quiz.questions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))
  };
}

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Quiz {
  _id: string;
  title: string;
  difficulty: string;
  questions: Question[];
}

interface QuizAttempt {
  _id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: {
    questionIndex: number;
    userAnswer: string;
    isCorrect: boolean;
  }[];
  timeSpent: number;
}

interface QuizState {
  activeQuiz: Quiz | null;
  history: any[];
  loading: boolean;
  generating: boolean;
  submitting: boolean;
  currentAttempt: QuizAttempt | null;
}

const initialState: QuizState = {
  activeQuiz: null,
  history: [],
  loading: false,
  generating: false,
  submitting: false,
  currentAttempt: null,
};

export const generateQuizAction = createAsyncThunk(
  'quiz/generate',
  async ({ noteId, docIds, difficulty, questionCount }: any) => {
    try {
      const res = await makeHttpReq(
        'POST',
        '/api/v1/notes/quiz/generate',
        { noteId, docIds, difficulty, questionCount }
      ) as any;
      return res.quiz;
    } catch (error: any) {
      showError(error.message || "Failed to generate quiz");
      throw error;
    }
  }
);

export const submitQuizAction = createAsyncThunk(
  'quiz/submit',
  async ({ quizId, answers, timeSpent }: any) => {
    try {
      const res = await makeHttpReq(
        'POST',
        '/api/v1/notes/quiz/submit',
        { quizId, answers, timeSpent }
      ) as any;
      return res.attempt;
    } catch (error: any) {
      showError(error.message || "Failed to submit quiz");
      throw error;
    }
  }
);

export const fetchQuizHistoryAction = createAsyncThunk(
  'quiz/history',
  async (noteId: string) => {
    try {
      const res = await makeHttpReq(
        'GET',
        `/api/v1/notes/quiz/history?noteId=${noteId}`
      ) as any;
      return res.history;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setActiveQuiz: (state, action: PayloadAction<Quiz | null>) => {
      state.activeQuiz = shuffleQuiz(action.payload);
      state.currentAttempt = null;
    },
    clearAttempt: (state) => {
      state.currentAttempt = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuizAction.pending, (state) => {
        state.generating = true;
      })
      .addCase(generateQuizAction.fulfilled, (state, action) => {
        state.generating = false;
        state.activeQuiz = shuffleQuiz(action.payload);
        // Automatically add to history so it shows up in RightPanel immediately
        state.history.unshift(action.payload);
      })
      .addCase(generateQuizAction.rejected, (state) => {
        state.generating = false;
      })
      .addCase(submitQuizAction.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitQuizAction.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentAttempt = action.payload;
        
        // Also add the attempt to the quiz in the history array
        const attempt = action.payload;
        const quizIndex = state.history.findIndex(q => q._id === attempt.quizId);
        if (quizIndex !== -1) {
          if (!state.history[quizIndex].attempts) {
            state.history[quizIndex].attempts = [];
          }
          state.history[quizIndex].attempts.unshift(attempt);
        }
      })
      .addCase(submitQuizAction.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(fetchQuizHistoryAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuizHistoryAction.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchQuizHistoryAction.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setActiveQuiz, clearAttempt } = quizSlice.actions;
export default quizSlice.reducer;
