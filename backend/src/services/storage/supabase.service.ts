import { createClient } from "@supabase/supabase-js";
import { env } from "@/config/env";
import WebSocket from "ws";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { WebSocket },
  realtime: { transport: WebSocket }
});
