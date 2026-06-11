import { Router } from "express";
import { getFolders, createFolder, renameFolder, deleteFolder, moveNoteToFolder } from "../folder.controller";

export const folderRoutes = (router: Router) => {
    const r = Router();
    
    r.get("/folders", getFolders);
    r.post("/folders", createFolder);
    r.put("/folders/:folderId", renameFolder);
    r.delete("/folders/:folderId", deleteFolder);
    
    r.patch("/notes/:noteId/move", moveNoteToFolder);

    router.use(r);
    return r;
};
