import multer, { FileFilterCallback } from "multer";
import { Router } from "express";
import { createNote } from "../createNote";
import { createBlankNote } from "../createBlankNote";
import { uploadFiles } from "../uploadFiles";

const storage = multer.memoryStorage();
    


const documentFileFilter = (req: any, file: any, cb: FileFilterCallback) => {
    const allowedTypes = /pdf|doc|docx|html|csv|txt|json|md|mp3|wav|mpeg|audio/;
    const isDoc = allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname.toLowerCase());

    if(isDoc){
        cb(null, true);
    }
    else {
        cb(new Error("Invalid File Type. Allowed: pdf, doc, docx, html, csv, txt, json, md, mp3, wav"));
    }
}
const upload = multer({ 
    storage,
    fileFilter: documentFileFilter,
    limits: {fileSize: 10 * 1024 * 1024} // 10 MB 
});

export const createNoteRouter = (router: Router) => {
    router.post(
        "/notes",
        upload.single("doc"),
        createNote
    );

    router.post("/blank/notes", createBlankNote);

    router.post("/notes/upload-files", upload.array("doc"), uploadFiles);

    return router;
};