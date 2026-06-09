import cors from "cors";
import helmet from "helmet";
import express, { Express, Router, Request, Response } from "express";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { cwd } from "process";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { errorHandler } from "@/middleware/error.middleware";
import { rateLimit } from "@/middleware/rate-limit.middleware";
import { configurePassport } from "../passport/passport.config";
import { apiV1 } from "@/app/routes/apiV1";

export function expressServer(app: Express, PORT: number) {
  const router = Router();

  // ─── Security headers ──────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
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

  // ─── Session ────────────────────────────────────────────
  const sess: session.SessionOptions = {
    store: MongoStore.create({
      mongoUrl: env.DB_URL,
      collectionName: "sessions",
    }),
    secret: env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sess));

  // ─── Passport ───────────────────────────────────────────
  app.use(passport.initialize());
  app.use(passport.session());
  configurePassport();

  // ─── API Routes ─────────────────────────────────────────
  apiV1(app, router);

  // ─── Auth Routes ────────────────────────────────────────
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/drive.file",
      ],
      accessType: "offline",
      prompt: "consent",
    } as any)
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${env.FRONTEND_URL}/auth/login`,
      successRedirect: `${env.FRONTEND_URL}/auth/callback`,
    }) 
  );

  app.get("/auth/me", (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: { message: "User not logged in", status: 401 } });
      return;
    }
    res.json(req.user);
  });

  app.get("/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        res.status(500).json({ error: { message: "Logout failed", status: 500 } });
        return;
      }
      req.session.destroy(() => {
        res.clearCookie("connect.sid",{
          path:"/",
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: "lax"
        })
        return res.json({ message: "Logged out successfully" });
      });
    });
  });

  // ─── Error Handler (must be last) ──────────────────────
  app.use(errorHandler);

  // ─── Start Server ──────────────────────────────────────
  app.listen(PORT, () => {
    logger.info(`Server running at ${env.APP_URL} [${env.NODE_ENV}]`);
  });
}
