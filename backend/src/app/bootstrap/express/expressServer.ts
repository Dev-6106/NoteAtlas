import { Express, Request, Response, Router } from "express";
import cors from "cors";
import express from "express";
import { handleExpressError } from "../exceptions/handleExpressError";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserRepository } from "@/app/http/controllers/auth/repository/user.repository";
import { apiV1 } from "@/app/routes/apiV1";
import MongoStore from "connect-mongo";

export function expressServer(app: Express, PORT: number) {
  const router = Router();
  app.use(
    cors({
      origin: "http://localhost:8000",
      credentials: true,
    }),
  );

  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Express app is running" });
  });

  const sess = {
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/notebooklm",
      collectionName: "sessions",
    }),
    secret: process.env.COOKIE_KEY as string,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  };

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    sess.cookie.secure = true;
  }

  app.use(session(sess));
  app.use(passport.initialize());
  app.use(passport.session());

  // register application routes after session & passport so req.user and session
  // are available to route handlers (fixes missing accessToken in authenticated routes)
  apiV1(app, router);

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL:
          process.env.CALLBACK_URL || "http://localhost:8000/auth/google/callback",
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          const email = profile?.emails?.[0]?.value;
          const googleId = profile?.id;
          if (!email || !googleId) {
            return done(new Error("Google profile missing required fields"), null);
          }

          const userRepo = UserRepository.getInstance();
          const userInstance = await userRepo.createUser(
            {
              ...profile,
              email,
              googleId,
            },
            { accessToken, refreshToken },
          );

          return done(null, userInstance);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    console.log("User in seri::: ", user);
    done(null, user);
  });

  passport.deserializeUser(async (obj: any, done) => {
    try {
      done(null, obj);
    } catch (error) {
      done(error);
    }
  });

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
    }),
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth/login",
      successRedirect: process.env.REACT_APP_URL || "http://localhost:8000",
    }),
  );

  app.get("/auth/me", (req: any, res: any) => {
    if (!req.user) return res.status(401).json({ error: "User not logged in" });
    res.json(req.user);
  });

  app.use(handleExpressError);

  app.listen(PORT, () => {
    console.log(`App is running at port ${PORT}...`);
  });
}
