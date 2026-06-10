import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "./error.middleware";
import { adminAuth } from "@/config/firebase-admin";
import { User } from "@/app/models/user.models";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

/**
 * Middleware that verifies the Firebase ID token from the Authorization header.
 * On success, attaches `req.userId` for downstream handlers.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed authorization header");
    }

    const token = header.slice(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Find the user in DB by firebaseUid
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      throw new UnauthorizedError("User not found in database");
    }

    req.userId = user._id.toString();
    req.user = user;
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
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);
      const decodedToken = await adminAuth.verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      if (user) {
        req.userId = user._id.toString();
        req.user = user;
      }
    }
  } catch {
    // Token invalid or expired — continue without auth
  }
  next();
}

/**
 * Middleware to ensure a user is authenticated. 
 * Replaces the old passport ensureAuthenticated.
 */
export async function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // We can just use requireAuth logic here or wrap it
  await requireAuth(req, res, next);
}
