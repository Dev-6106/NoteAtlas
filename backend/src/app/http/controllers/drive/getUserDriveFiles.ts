import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { env } from "@/config/env";

export async function getUserDriveFiles(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as any;
    if (!user?.authData?.googleAccessToken) {
      return res.status(401).json({ error: { message: "No Google access token found", status: 401 } });
    }

    const oauth2client = new google.auth.OAuth2({
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      clientId: env.GOOGLE_CLIENT_ID,
    });

    oauth2client.setCredentials({
      access_token: user.authData.googleAccessToken,
      refresh_token: user.authData.googleRefreshToken,
    });

    const drive = google.drive({ version: "v3", auth: oauth2client });

    const response = await drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType, webViewLink)",
    });

    res.json(response.data.files);
  } catch (error) {
    next(error);
  }
}