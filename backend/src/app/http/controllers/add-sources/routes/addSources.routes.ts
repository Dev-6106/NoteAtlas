import { Router } from "express";
import { storeDriveFiles } from "../storeDriveFiles";
import { storeWebLinkFiles } from "../storeWebLinkData";
import { storeTextData } from "../storeTextData";
import { storeYouTubeScript } from "../storeYouTubeScript";
import { createBlankNote } from "../../notes/createBlankNote";
import { createNote } from "../../notes/createNote";
import multer, { FileFilterCallback } from "multer";
import { cwd } from "process";
import fs from "fs";
import { uploadFiles } from "../../notes/uploadFiles";
import { storeUploadFiles } from "../storeUploadFIles";
import path from "path";
import { searchWeb } from "../searchWeb";

const currDir = cwd();
const uploadsDir = path.join(currDir, "public", "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
    
const storage = multer.diskStorage({
    destination: (req, file, cb) => {cb(null, uploadsDir);},
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const documentFileFilter = (req: any, file: any, cb: FileFilterCallback) => {
    const allowedTypes = /pdf|doc|docx|html|csv|txt/;
    const isDoc = allowedTypes.test(file.mimetype) || allowedTypes.test(file.originalname);
    if(isDoc){
        cb(null, true);
    }
    else {
        cb(new Error("Invalid File Type. Only pdf,doc,docx,csv,txt allowed"));
    }
}
const upload = multer({ 
    storage,
    fileFilter: documentFileFilter,
    limits: {fileSize: 2 * 1024 * 1024} //2 MB 
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

export function addSourceRoutes(router: Router) {
    router.post('/notes/drive-files', storeDriveFiles);
    router.post('/notes/weblinkdata', storeWebLinkFiles);
    router.post('/notes/text-data', storeTextData);
    router.post('/notes/youtube-link',storeYouTubeScript);
    router.post('/notes/upload-files',upload.single("doc"),storeUploadFiles);
    router.get('/notes/search/web',searchWeb);
    return router;  
}