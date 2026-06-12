import { User } from "@/app/models/user.models";
import mongoose from "mongoose";

import { AppError } from "@/middleware/error.middleware";

/**
 * Deduct credits from a user. Returns false and throws if insufficient balance.
 */
export async function deductCredits(userId: string, amount: number): Promise<void> {
    const result = await User.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId), credits: { $gte: amount } },
        { $inc: { credits: -amount } },
        { new: true }
    );

    if (!result) {
        throw new AppError("Insufficient credits. Please recharge to continue using AI features.", 402, true);
    }
}

/**
 * Add credits to a user (called after successful payment).
 */
export async function addCredits(userId: string, amount: number): Promise<number> {
    const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: amount } },
        { new: true }
    );
    return user?.credits ?? 0;
}

/**
 * Get current credit balance for a user.
 */
export async function getCredits(userId: string): Promise<number> {
    const user = await User.findById(userId).select("credits");
    return user?.credits ?? 0;
}
