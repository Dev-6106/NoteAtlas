import { z } from "zod";

const envSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  APP_URL: z.string().url().default("http://localhost:8000"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  // Database
  DB_URL: z.string().min(1, "DB_URL is required"),

  // LLM
  GOOGLE_GEMINI_API_KEY: z.string().min(1, "GOOGLE_GEMINI_API_KEY is required"),
  CHATFIREWORK_API_KEY: z.string().optional(), // kept for image generation
  GROQ_API_KEY: z.string().optional(), // kept for backward compat

  // LangChain / Tavily
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),

  // Hugging Face
  HUGGINGFACE_API_KEY: z.string().min(1, "HUGGINGFACE_API_KEY is required"),

  // RAG - Cohere
  COHERE_API_KEY: z.string().min(1, "COHERE_API_KEY is required"),

  // RAG - Pinecone
  PINECONE_API_KEY: z.string().min(1, "PINECONE_API_KEY is required"),
  PINECONE_INDEX: z.string().min(1).default("notebooklm"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  CALLBACK_URL: z
    .string()
    .url()
    .default("http://localhost:8000/auth/google/callback"),

  // Session
  COOKIE_KEY: z.string().min(16, "COOKIE_KEY must be at least 16 characters"),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, "JWT_REFRESH_SECRET must be at least 16 characters"),
  // Supabase Storage
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  SUPABASE_BUCKET: z.string().min(1, "SUPABASE_BUCKET is required"),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error(
      "\n╔══════════════════════════════════════════╗"
    );
    console.error(
      "║   ⚠  Environment Validation Failed  ⚠   ║"
    );
    console.error(
      "╚══════════════════════════════════════════╝\n"
    );
    console.error(formatted);
    console.error(
      "\nCopy backend/.env.example to backend/.env and fill in all values.\n"
    );

    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
