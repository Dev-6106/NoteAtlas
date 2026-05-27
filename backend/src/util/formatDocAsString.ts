import { NextFunction, Request, Response } from "express";
import { cwd } from "process";
import path from "path";
import fs from "fs/promises";


export function formatDocumentAsString(documents: any[]): string {
    return documents
        .map((doc, index) => {
            return `
========================
DOCUMENT ${index + 1}
========================

CONTENT:
${doc.pageContent || "No content"}

------------------------

METADATA:
${JSON.stringify(doc.metadata || {}, null, 2)}

`;
        })
        .join("\n");
}
