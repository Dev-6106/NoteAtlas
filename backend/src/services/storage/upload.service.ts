import { supabase } from "./supabase.service";
import { env } from "@/config/env";
import path from "path";
import crypto from "crypto";

export async function uploadToStorage(
    fileBuffer: Buffer | Uint8Array | NodeJS.ReadableStream | string, 
    originalName: string, 
    mimeType: string, 
    folder: string = "uploads"
): Promise<string> {
    const ext = path.extname(originalName);
    const uniqueFileName = `${folder}/${crypto.randomUUID()}${ext}`;
    
    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET)
        .upload(uniqueFileName, fileBuffer, {
            contentType: mimeType,
            upsert: false
        });

    if (error) {
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    return uniqueFileName;
}

export async function uploadTextToStorage(
    text: string, 
    folder: string = "uploads"
): Promise<string> {
    const uniqueFileName = `${folder}/${crypto.randomUUID()}.txt`;
    
    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET)
        .upload(uniqueFileName, text, {
            contentType: "text/plain",
            upsert: false
        });

    if (error) {
        throw new Error(`Failed to upload text to Supabase: ${error.message}`);
    }

    return uniqueFileName;
}
