/**
 * pipelineUtils.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared, production-grade utilities for every LangGraph map-reduce pipeline.
 *
 * Rate-limit strategy
 * ────────────────────
 * Google Gemini free tier: 15 RPM, 1,000,000 TPM for gemini-2.0-flash.
 * We treat the limit conservatively as 15 RPM = 1 request per 4 seconds.
 * A token-bucket throttle enforces this BEFORE each request so we never
 * even reach a 429 under normal conditions. Retry logic is a last resort
 * for bursts or transient spikes, not the primary flow-control mechanism.
 */

import { Document } from "@langchain/core/documents";
import { Runnable }  from "@langchain/core/runnables";

// ─────────────────────────────────────────────────────────────────────────────
// 1.  TOKEN ESTIMATION
// ─────────────────────────────────────────────────────────────────────────────

export function approximateTokens(text: string): number {
  return Math.ceil(text.length / 3);
}

export function lengthFunction(documents: Document[]): number {
  return documents.reduce(
    (sum, doc) => sum + approximateTokens(doc.pageContent),
    0,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  REQUEST THROTTLE  (proactive — fires BEFORE each request)
//
//  MIN_REQUEST_GAP_MS = 12000 → max 5 req/min, safe for Fireworks free tier.
//  Lower values risk 429s; higher values are always safe.
// ─────────────────────────────────────────────────────────────────────────────

const MIN_REQUEST_GAP_MS = 12_000; // 5 RPM ceiling (Fireworks free tier)
let   lastRequestAt      = 0;     // epoch ms of the last dispatched request
let   throttlePromise: Promise<void> = Promise.resolve();

export async function throttle(): Promise<void> {
  const currentPromise = throttlePromise;
  
  throttlePromise = (async () => {
    await currentPromise;
    const now = Date.now();
    const wait = lastRequestAt + MIN_REQUEST_GAP_MS - now;
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait));
    }
    lastRequestAt = Date.now();
  })();

  return throttlePromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.  GLOBAL RATE-LIMIT GATE  (reactive — fires AFTER a 429)
//
//  If a 429 still slips through despite throttling, this gate pauses ALL
//  workers until the Retry-After window expires.
// ─────────────────────────────────────────────────────────────────────────────

export let rateLimitedUntil = 0;

function parseRetryAfter(err: any): number {
  const header =
    err?.response?.headers?.get?.("retry-after") ??
    err?.headers?.["retry-after"] ??
    err?.error?.headers?.["retry-after"];
  if (header) {
    const secs = parseFloat(header);
    if (!isNaN(secs)) return secs * 1000;
  }
  const match = String(err?.message ?? "").match(/try again in ([\d.]+)s/i);
  if (match) return parseFloat(match[1]) * 1000;
  return 0;
}

export async function waitForRateLimit(): Promise<void> {
  const wait = rateLimitedUntil - Date.now();
  if (wait > 0) {
    console.warn(`[pipeline] rate-limit gate: waiting ${Math.round(wait / 1000)}s before next request…`);
    await new Promise((r) => setTimeout(r, wait));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.  CONCURRENCY LIMITER
// ─────────────────────────────────────────────────────────────────────────────

export async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, tasks.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5.  RETRY  (last resort — throttle + gate should prevent most 429s)
// ─────────────────────────────────────────────────────────────────────────────

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const MAX_ATTEMPTS = 6;
  let attempt = 0;

  while (true) {
    await waitForRateLimit(); // check gate before every attempt
    await throttle();         // enforce minimum gap before every attempt

    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const status: number = err?.response?.status ?? err?.status ?? 0;

      if (status !== 429 && status !== 413 && status < 500 && status !== 0) throw err; // non-retryable
      if (attempt >= MAX_ATTEMPTS) throw err;

      if (status === 429 || status === 413) {
        // Read exact Retry-After; fall back to 60 s if header missing
        const retryAfterMs = parseRetryAfter(err) || 60_000;
        const until = Date.now() + retryAfterMs;
        if (until > rateLimitedUntil) rateLimitedUntil = until;

        // Also advance lastRequestAt so throttle() re-aligns to post-pause
        lastRequestAt = rateLimitedUntil;

        console.warn(
          `[pipeline] 429 — backing off ${Math.round(retryAfterMs / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS - 1})`,
        );
      } else {
        // 5xx / network: short exponential backoff
        const delay = Math.min(1_000 * 2 ** (attempt - 1), 15_000);
        console.warn(`[pipeline] attempt ${attempt} failed (status=${status}), retrying in ${delay}ms…`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.  IN-PROCESS LRU CACHE
// ─────────────────────────────────────────────────────────────────────────────

function hashKey(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

class LRUCache<V> {
  private map = new Map<string, V>();
  constructor(private maxSize: number) {}

  get(key: string): V | undefined {
    if (!this.map.has(key)) return undefined;
    const v = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, v);
    return v;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.maxSize) {
      this.map.delete(this.map.keys().next().value!);
    }
  }
}

export const responseCache = new LRUCache<string>(512);

// ─────────────────────────────────────────────────────────────────────────────
// 7.  CACHED LLM INVOCATION
// ─────────────────────────────────────────────────────────────────────────────

export async function cachedInvoke<T extends Runnable>(
  llm: T,
  promptMessages: any,
): Promise<string> {
  const cacheKey = hashKey(JSON.stringify(promptMessages));
  const cached = responseCache.get(cacheKey);
  if (cached) {
    console.debug("[pipeline] cache hit");
    return cached;
  }
  const result = await withRetry(() => llm.invoke(promptMessages));
  const text = String((result as any).content ?? result);
  responseCache.set(cacheKey, text);
  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8.  DOCUMENT HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function deduplicateDocs(docs: Document[]): Document[] {
  const seen = new Set<string>();
  return docs.filter((d) => {
    const key = d.pageContent.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function splitListOfDocs(
  docs: Document[],
  tokenMax: number,
): Document[][] {
  const chunks: Document[][] = [];
  let current: Document[] = [];

  for (const doc of docs) {
    const test = [...current, doc];
    if (lengthFunction(test) > tokenMax && current.length > 0) {
      chunks.push(current);
      current = [doc];
    } else {
      current = test;
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}