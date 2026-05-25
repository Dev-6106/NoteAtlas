import express from "express";
import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";

export async function getUserDriveFiles( req: Request, res: Response, next: NextFunction){
    try {
        const user = req.user as any;
        if(!user?.authData?.googleAccessToken){
            return res.status(401).json({message: "No google access token found"});
        }

        const oauth2client = new google.auth.OAuth2({
            client_secret:process.env.GOOGLE_CLIENT_SECRET as string,
            client_id: process.env.GOOGLE_CLIENT_ID
        });

        oauth2client.setCredentials({
            access_token: user?.authData?.googleAccessToken,
            refresh_token: user?.authData?.googleRefreshToken
        })

        const drive = google.drive({version: "v3", auth: oauth2client});

        const response = await drive.files.list({
            pageSize: 10,
            fields: "files(id, name, mimeType, webViewLink)",
        });

        res.json(response.data.files);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Failed to Fetch Drive Files"});
    }
}