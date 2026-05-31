import { Router } from "express";
import { storeDriveFiles } from "../storeDriveFiles";
import { storeWebLinkFiles } from "../storeWebLinkData";
import { storeTextData } from "../storeTextData";
import { createBlankNote } from "../../notes/createBlankNote";
import { createNote } from "../../notes/createNote";
import multer, { FileFilterCallback } from "multer";
import { uploadFiles } from "../../notes/uploadFiles";
import { storeUploadFiles } from "../storeUploadFIles";
import { searchWeb } from "../searchWeb";

const storage = multer.memoryStorage();
    


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

export function addSourceRoutes(router: Router) {
    router.post('/notes/drive-files', storeDriveFiles);
    router.post('/notes/weblinkdata', storeWebLinkFiles);
    router.post('/notes/text-data', storeTextData);
    router.post('/notes/upload-files',upload.single("doc"),storeUploadFiles);
    router.get('/notes/search/web',searchWeb);
    return router;  
}