import { supabase } from "./supabase.service";
import { env } from "@/config/env";

export async function deleteFromStorage(key: string): Promise<void> {
    const { error } = await supabase.storage
        .from(env.SUPABASE_BUCKET)
        .remove([key]);

    if (error) {
        throw new Error(`Failed to delete from Supabase: ${error.message}`);
    }
}
