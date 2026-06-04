// Simple inline concurrency limit (semaphore)
const createLimit = (concurrency: number) => {
  let active = 0;
  const queue: (() => void)[] = [];

  const next = () => {
    active--;
    if (queue.length > 0) {
      const resolve = queue.shift();
      active++;
      resolve?.();
    }
  };

  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (active >= concurrency) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    active++;
    try {
      return await fn();
    } finally {
      next();
    }
  };
};

const limit = createLimit(2); // Global concurrency limit for LLM calls

/**
 * Shared retry utility for LLM invocations.
 * Retries on rate limit (429) and timeout errors with exponential backoff + jitter.
 * Wraps calls in a concurrency limiter to prevent hammering the API.
 */
import { throttle, waitForRateLimit } from "@/pipelines/pipelineUtils";

export async function invokeWithRetry<T>(
  fn: () => Promise<T>,
  retries = 8
): Promise<T> {
  return limit(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        await waitForRateLimit();
        await throttle();
        return await fn();
      } catch (err: any) {
        const isRateLimit =
          err?.status === 429 ||
          err?.code === "RATE_LIMIT_EXCEEDED" ||
          err?.message?.includes("429");

        const isTimeout =
          err?.name === "TimeoutError" ||
          err?.code === "ETIMEDOUT" ||
          err?.code === "ECONNRESET" ||
          err?.message?.includes("timed out") ||
          err?.message?.includes("timeout");

        if (isRateLimit || isTimeout) {
          const baseWait = Math.min(Math.pow(2, i) * 2000, 30000); // cap wait to 30s
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
  });
}

