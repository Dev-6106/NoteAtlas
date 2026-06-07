import { User } from "@/app/models/user.models";

/**
 * Deduct credits from a user. Returns false and throws if insufficient balance.
 */
export async function deductCredits(userId: string, amount: number): Promise<void> {
    const result = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: amount } },
        { $inc: { credits: -amount } },
        { new: true }
    );

    if (!result) {
        const err: any = new Error("Insufficient credits. Please recharge to continue using AI features.");
        err.statusCode = 402;
        throw err;
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
