import mongoose from "mongoose";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export async function dbConnection(): Promise<void> {
  try {
    await mongoose.connect(env.DB_URL, {
      family: 4, // Force IPv4 to prevent TLS alert 80 on Windows
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("Database connected successfully");

    mongoose.connection.on("error", (error) => {
      logger.error("Database connection error", error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Database disconnected");
    });
  } catch (error) {
    logger.error("Database connection failed", error);
    process.exit(1);
  }
}