import { Request, Response } from "express";
import { Folder } from "@/app/models/folder.models";
import { Note } from "@/app/models/note.models";

export const getFolders = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const folders = await Folder.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ folders });
    } catch (error) {
        res.status(500).json({ message: "Failed to get folders", error });
    }
};

export const createFolder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name } = req.body;
        
        if (!name) return res.status(400).json({ message: "Name is required" });

        const folder = new Folder({ name, userId });
        await folder.save();

        res.status(201).json({ folder });
    } catch (error) {
        res.status(500).json({ message: "Failed to create folder", error });
    }
};

export const renameFolder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { folderId } = req.params;
        const { name } = req.body;

        if (!name) return res.status(400).json({ message: "Name is required" });

        const folder = await Folder.findOneAndUpdate(
            { _id: folderId, userId },
            { name },
            { new: true }
        );

        if (!folder) return res.status(404).json({ message: "Folder not found" });

        res.status(200).json({ folder });
    } catch (error) {
        res.status(500).json({ message: "Failed to rename folder", error });
    }
};

export const deleteFolder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { folderId } = req.params;

        const folder = await Folder.findOneAndDelete({ _id: folderId, userId });
        
        if (!folder) return res.status(404).json({ message: "Folder not found" });

        // Remove folder references from notes
        await Note.updateMany({ folderId, userId }, { $set: { folderId: null } });

        res.status(200).json({ message: "Folder deleted successfully", folderId });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete folder", error });
    }
};

export const moveNoteToFolder = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { noteId } = req.params;
        const { folderId } = req.body; // null to move out of folder

        const note = await Note.findOneAndUpdate(
            { _id: noteId, userId },
            { folderId: folderId || null },
            { new: true }
        );

        if (!note) return res.status(404).json({ message: "Note not found" });

        res.status(200).json({ note });
    } catch (error) {
        res.status(500).json({ message: "Failed to move note", error });
    }
};
