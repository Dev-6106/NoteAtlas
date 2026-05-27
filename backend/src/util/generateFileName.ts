import crypto from "crypto";

export const generateFileName = (fileName: string) => {
    const timestamp = Date.now();
    const ext = fileName.substring(fileName.lastIndexOf("."));
    const baseName = fileName
        .substring(0,fileName.lastIndexOf("."))
        .toLowerCase()
        .replace(/\s+/g,"")

    return `${baseName}-${timestamp}${ext}`; 
};

export function generateUniqueFileName(prefix="doc", extension="txt"): string {
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(3).toString("hex");
    return `${prefix}-${timestamp}-${randomStr}.${extension}`
}