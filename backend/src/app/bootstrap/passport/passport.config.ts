import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserRepository } from "@/app/http/controllers/auth/repository/user.repository";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Configure Passport.js with Google OAuth 2.0 strategy.
 */
export function configurePassport(): void {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const email = profile?.emails?.[0]?.value;
          const googleId = profile?.id;
          if (!email || !googleId) {
            return done(
              new Error("Google profile missing required fields"),
              null
            );
          }

          const userRepo = UserRepository.getInstance();
          const userInstance = await userRepo.createUser(
            {
              ...profile,
              email,
              googleId,
            },
            { accessToken, refreshToken }
          );

          return done(null, userInstance);
        } catch (error) {
          logger.error("Passport Google strategy error", error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });
}
