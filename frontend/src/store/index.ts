import { configureStore } from "@reduxjs/toolkit";
import chatSlice  from './chatSlice'
import { useDispatch } from "react-redux";
import notesSlice from './noteSlice'
import  addSourceSlice  from "./addSourceSlice";
import discoveryModalSlice from './discoveryModalSlice'
import rightPanelSlice from './rightPanelSlice'
import chatHistorySlice from './chatHistorySlice'
import creditMenuSlice from './creditMenuSlice'
import quizReducer from './quizSlice';
import flashcardReducer from './flashcardSlice';

export const store = configureStore({
  reducer: {
     chat:chatSlice,
     note:notesSlice,
     addSource:addSourceSlice,
     discoveryModal:discoveryModalSlice,
     rightPanel:rightPanelSlice,
     chatHistory:chatHistorySlice,
     creditMenu:creditMenuSlice,
     quiz: quizReducer,
     flashcard: flashcardReducer
  },
})




