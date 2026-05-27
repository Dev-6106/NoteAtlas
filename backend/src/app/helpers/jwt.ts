import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "@/config/env";

/** Access token lifespan: 2 hours */
const ACCESS_TOKEN_EXPIRY = 7200;

/** Refresh token lifespan: 7 days */
const REFRESH_TOKEN_EXPIRY = 604800;

function createPayload(userId: Types.ObjectId, expiresIn: number) {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "notebooklm",
    sub: userId.toString(),
    aud: userId.toString(),
    exp: now + expiresIn,
    iat: now,
  };
}

export function signAccessToken(userId: Types.ObjectId): Promise<string> {
  const payload = createPayload(userId, ACCESS_TOKEN_EXPIRY);

  return new Promise((resolve, reject) => {
    jwt.sign(payload, env.JWT_ACCESS_SECRET, (error, token) => {
      if (error || !token) reject(error ?? new Error("Token generation failed"));
      else resolve(token);
    });
  });
}

export function signRefreshToken(userId: Types.ObjectId): Promise<string> {
  const payload = createPayload(userId, REFRESH_TOKEN_EXPIRY);

  return new Promise((resolve, reject) => {
    jwt.sign(payload, env.JWT_REFRESH_SECRET, (error, token) => {
      if (error || !token) reject(error ?? new Error("Token generation failed"));
      else resolve(token);
    });
  });
}

export async function generateToken(userId: Types.ObjectId) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId),
    signRefreshToken(userId),
  ]);

  return { accessToken, refreshToken };
}