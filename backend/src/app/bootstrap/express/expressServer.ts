import cors from "cors";
import helmet from "helmet";
import express, { Express, Router, Request, Response } from "express";
import { cwd } from "process";
import path from "path";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { errorHandler } from "@/middleware/error.middleware";
import { rateLimit } from "@/middleware/rate-limit.middleware";
import { apiV1 } from "@/app/routes/apiV1";
import { adminAuth } from "@/config/firebase-admin";
import { UserRepository } from "@/app/http/controllers/auth/repository/user.repository";

export function expressServer(app: Express, PORT: number) {
  const router = Router();

  // ─── Security headers ──────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }));

  // ─── CORS ────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );

  // ─── Body Parsing ────────────────────────────────────────
  const currDir = cwd();
  app.use(express.static(path.join(currDir, "public")));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Rate Limiting ──────────────────────────────────────
  app.use(rateLimit(60_000, 100));

  // ─── Health Check ───────────────────────────────────────
  app.get("/", (_req: Request, res: Response) => {
    res.json({ status: "ok", message: "NotebookLM API is running" });
  });

  app.get("/health", async (_req: Request, res: Response) => {
    try {
      const mongoose = require("mongoose");
      const dbState = mongoose.connection.readyState;
      if (dbState !== 1) {
        return res.status(503).json({ status: "error", message: "Database not connected" });
      }
      
      // Could add Pinecone/Supabase checks here

      res.json({ 
        status: "ok", 
        message: "NotebookLM API is healthy",
        timestamp: new Date().toISOString(),
        database: "connected"
      });
    } catch (error: any) {
      res.status(503).json({ status: "error", message: error.message });
    }
  });

  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // ─── Auth Routes ──
  app.post("/api/v1/auth/sync", async (req: Request, res: Response) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: { message: "Missing authorization header", status: 401 } });
        return;
      }
      const token = header.slice(7);
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      const userRepo = UserRepository.getInstance();
      const userInstance = await userRepo.syncUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      });

      res.json(userInstance);
    } catch (error: any) {
      logger.error("Auth sync error", {
        code: error.code,
        message: error.message,
        errorInfo: error.errorInfo,
      });
      
      let userMessage = "Invalid or expired token";
      if (error.code === "auth/id-token-expired") {
        userMessage = "Token has expired. Please sign in again.";
      } else if (error.code === "auth/argument-error") {
        userMessage = "Server authentication configuration error.";
      }
      
      res.status(401).json({ error: { message: userMessage, status: 401 } });
    }
  });

  app.get("/api/v1/auth/me", async (req: Request, res: Response) => {
    try {
      const header = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
         res.status(401).json({ error: { message: "User not logged in", status: 401 } });
         return;
      }
      const token = header.slice(7);
      const decodedToken = await adminAuth.verifyIdToken(token);
      
      const userRepo = UserRepository.getInstance();
      const user = await userRepo.syncUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture
      });
      res.json(user.authData);
    } catch (error) {
      res.status(401).json({ error: { message: "User not logged in", status: 401 } });
    }
  });

  app.get("/api/v1/auth/logout", (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  // ─── API Routes (ensureAuthenticated applied here) ─────
  apiV1(app, router);

  // ─── Error Handler (must be last) ──────────────────────
  app.use(errorHandler);

  // ─── Start Server ──────────────────────────────────────
  app.listen(PORT, () => {
    logger.info(`Server running at ${env.APP_URL} [${env.NODE_ENV}]`);
  });
}
