import { supabase } from "./supabase.service";
import { env } from "@/config/env";

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await supabase.storage
        .from(env.SUPABASE_BUCKET)
        .createSignedUrl(key, expiresIn);

    if (error || !data) {
        throw new Error(`Failed to create presigned URL: ${error?.message || "No data returned"}`);
    }

    return data.signedUrl;
}
