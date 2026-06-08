import express from "express";
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');
import "dotenv/config";
import { env } from "./config/env";
import { bootStrapApp } from "./app/bootstrap/index";
import { logger } from "./lib/logger";

const app = express();

// ─── Graceful Shutdown ────────────────────────────────────
function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", reason);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

// ─── Bootstrap ────────────────────────────────────────────
bootStrapApp(app, env.PORT);// Trigger restart
