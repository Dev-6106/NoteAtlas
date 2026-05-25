import express from "express";
import { Request, Response, NextFunction, Express } from "express";
import { NoteRepository } from "./repository/notes.respository";

export async function createContext(req: Request, res: Response, next: NextFunction){
    try {
        const NoteRepo = NoteRepository.getInstance();
        const newNote = await NoteRepo.createNote({name,image,userId});
    } catch (error) {
        next(error);
    }
}