import mongoose from "mongoose";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export async function dbConnection(): Promise<void> {
  try {
    await mongoose.connect(env.DB_URL);
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