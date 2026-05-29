/**
 * Shared retry utility for LLM invocations.
 * Retries on rate limit (429) and timeout errors with exponential backoff + jitter.
 */
export async function invokeWithRetry<T>(
  fn: () => Promise<T>,
  retries = 8
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const isRateLimit =
        err?.status === 429 ||
        err?.code === "RATE_LIMIT_EXCEEDED";

      const isTimeout =
        err?.name === "TimeoutError" ||
        err?.code === "ETIMEDOUT" ||
        err?.code === "ECONNRESET" ||
        err?.message?.includes("timed out") ||
        err?.message?.includes("timeout");

      if (isRateLimit || isTimeout) {
        const baseWait = Math.pow(2, i) * 2000; // start at 2s, then 4s, 8s, 16s...
        const jitter = Math.random() * 1000;     // add up to 1s of jitter
        const wait = baseWait + jitter;

        console.log(
          `[Retry ${i + 1}/${retries}] ${isRateLimit ? "Rate limited" : "Timeout"}. Retrying in ${Math.round(wait)}ms...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, wait)
        );
      } else {
        throw err;
      }
    }
  }

  throw new Error("Max retries exceeded after " + retries + " attempts");
}
