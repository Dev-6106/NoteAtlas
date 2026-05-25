import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

function jwtPayload(userId: Types.ObjectId) {
    return {
        iss: "notebooklm",
        sub: userId.toString(),
        aud: userId.toString(),
        exp: Math.floor(Date.now() / 1000) + 7200,
        iat: Math.floor(Date.now() / 1000),
    };
}

export function signAccessToken(userId: Types.ObjectId) {
    const payload = jwtPayload(userId);
    const key = process.env.JWT_TOKEN_KEY as string;

    return new Promise((resolve, reject) => {
        jwt.sign(payload, key, (error, token) => {
            if (error) reject(error);
            else resolve(token);
        });
    });
}

export function signRefreshToken(userId: Types.ObjectId) {
    const payload = jwtPayload(userId);
    const key = process.env.JWT_TOKEN_KEY as string;

    return new Promise((resolve, reject) => {
        jwt.sign(payload, key, (error, token) => {
            if (error) reject(error);
            else resolve(token);
        });
    });
}

export async function VerifyExpressToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        const accessToken = token.split(" ")[1];

        const key = process.env.JWT_TOKEN_KEY as string;

        jwt.verify(accessToken, key, (error) => {
            if (error) {
                return res.status(401).json({
                    message: "Unauthorized",
                });
            }

            next();
        });
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
}

export async function generateToken(userId: Types.ObjectId) {
    const [accessToken, refreshToken] = await Promise.all([
        signAccessToken(userId),
        signRefreshToken(userId),
    ]);

    return {
        accessToken,
        refreshToken,
    };
}