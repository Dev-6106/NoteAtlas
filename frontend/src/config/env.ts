/**
 * Validated environment configuration for the frontend.
 * All VITE_ prefixed variables are validated at module load time.
 */

function requireEnv(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Check your .env file against .env.example.`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  return import.meta.env[key] ?? fallback;
}

export const env = {
  /** Backend API base URL (no trailing slash) */
  apiUrl: requireEnv("VITE_API_URL").replace(/\/+$/, ""),

  /** Google Client ID for Drive Picker */
  googleClientId: optionalEnv("VITE_GOOGLE_CLIENT_ID"),

  /** Google Developer Key for Drive Picker */
  developerKey: optionalEnv("VITE_DEVELOPER_KEY"),

  /** Stripe publishable key */
  stripePubKey: optionalEnv("VITE_STRIPE_PUB_KEY"),

  /** Whether running in production */
  isProd: import.meta.env.PROD,

  /** Whether running in development */
  isDev: import.meta.env.DEV,
} as const;
