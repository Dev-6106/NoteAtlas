import { supabase } from "./supabase.service";
import { env } from "@/config/env";
import fs from "fs";

export async function downloadFromStorage(key: string, destPath: string): Promise<void> {
    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET)
        .download(key);
    
    if (error || !data) {
        throw new Error(`Failed to download from Supabase: ${error?.message || "No data returned"}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return fs.promises.writeFile(destPath, buffer);
}
