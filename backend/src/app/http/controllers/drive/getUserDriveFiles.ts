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
      redirectUri: env.CALLBACK_URL,
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
  } catch (error: any) {
    const googleStatus = error?.response?.status || error?.code;
    if (googleStatus === 403 || googleStatus === 401) {
      return res.status(googleStatus).json({
        message: "Google Drive access denied. Your access token may have expired. Please log out and log back in to refresh your Google permissions.",
        error: error?.response?.data?.error || error.message,
      });
    }
    next(error);
  }
}