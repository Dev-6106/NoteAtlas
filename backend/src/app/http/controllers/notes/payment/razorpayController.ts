import { Request, Response, NextFunction } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { addCredits, getCredits } from "@/app/helpers/credits";
import { User } from "@/app/models/user.models";
import { env } from "@/config/env";

const razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
});

// ─── Credit plans (INR) ──────────────────────────────────
export const CREDIT_PLANS = [
    {
        id: "pro",
        name: "Pro",
        priceInr: 499,
        credits: 3000,
        description: "Great for regular research and study",
    },
    {
        id: "premium",
        name: "Premium",
        priceInr: 999,
        credits: 10000,
        description: "Power users and heavy AI usage",
    },
] as const;

// POST /api/v1/payment/create-order
export async function createOrder(req: Request, res: Response, next: NextFunction) {
    try {
        const { planId, userId } = req.body;

        const plan = CREDIT_PLANS.find((p) => p.id === planId);
        if (!plan) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        const order = await razorpay.orders.create({
            amount: plan.priceInr * 100, // paise
            currency: "INR",
            receipt: `rcpt_${userId.slice(-8)}_${Date.now()}`,
            notes: {
                userId,
                planId,
                credits: plan.credits.toString(),
            },
        });

        return res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: env.RAZORPAY_KEY_ID,
            plan,
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/v1/payment/verify
export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planId } = req.body;

        // Verify signature
        const expectedSig = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSig !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed. Invalid signature." });
        }

        const plan = CREDIT_PLANS.find((p) => p.id === planId);
        if (!plan) {
            return res.status(400).json({ error: "Invalid plan" });
        }

        // Add credits atomically
        const newBalance = await addCredits(userId, plan.credits);

        return res.json({
            success: true,
            message: `${plan.credits} credits added to your account!`,
            credits: newBalance,
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/v1/payment/user-credits
export async function getUserCredits(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const credits = await getCredits(userId);
        const user = await User.findById(userId).select("razorpayCustomerId");

        return res.json({
            result: {
                credits,
                paymentType: user?.razorpayCustomerId ? "razorpay" : null,
            },
        });
    } catch (error) {
        next(error);
    }
}
