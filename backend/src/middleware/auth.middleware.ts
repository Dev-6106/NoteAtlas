import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UnauthorizedError } from "./error.middleware";

/**
 * Decoded JWT payload shape attached to req.userId.
 */
export interface JwtPayload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
}

// Extend Express Request to carry the authenticated userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware that verifies the JWT access token from the Authorization header.
 * On success, attaches `req.userId` for downstream handlers.
 */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed authorization header");
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    req.userId = decoded.sub;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError("Invalid or expired token"));
    }
  }
}

/**
 * Optional auth — attaches userId if token is present but doesn't reject otherwise.
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      req.userId = decoded.sub;
    }
  } catch {
    // Token invalid or expired — continue without auth
  }
  next();
}

/**
 * Middleware to ensure a user is authenticated via Passport.js session.
 */
export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Ensure req.user has an ID, and we can map it to req.userId for consistency if needed
    const userObj = req.user as any;
    if (userObj) {
      const id = userObj._id || userObj.authData?._id;
      if (id) {
        req.userId = id.toString();
      }
    }
    return next();
  }
  
  // For API endpoints, we return JSON. The frontend should handle the 401.
  next(new UnauthorizedError("You must be logged in to access this resource"));
}
