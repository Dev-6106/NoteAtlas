import { Express, Request, Response } from "express";
import cors from "cors";
import express from "express";
import { handleExpressError } from "../exceptions/handleExpressError";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export function expressServer(app: Express, PORT: number) {
  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(handleExpressError);

  app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Express app is running" });
  });

  const sess = {
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

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
        user: any
      ) => {
        console.log("Create user: ", user);
        return done(null, user);
      },
    ),
  );

  passport.serializeUser((user: any, done) => {});

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
      failureRedirect: "/auth/logn",
      successRedirect: process.env.REACT_APP_URL,
    }),
  );

  app.get("/auth/me", (req: any, res: any) => {
    if (!req.user) return res.status(401).json({ error: "User not logged in" });
    res.json(req.user);
  });
  app.listen(PORT, () => {
    console.log("App is running at port 8000...");
  });
}
