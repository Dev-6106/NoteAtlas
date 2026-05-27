import { Request, Response, NextFunction } from "express";
import { TooManyRequestsError } from "./error.middleware";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter.
 * For production, replace with Redis-backed limiter.
 *
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests per window per IP
 */
export function rateLimit(
  windowMs = 60_000,
  maxRequests = 60
) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup to prevent memory leaks
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, windowMs * 2);

  // Allow garbage collection of the interval
  if (cleanup.unref) {
    cleanup.unref();
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      next(new TooManyRequestsError());
      return;
    }

    next();
  };
}
