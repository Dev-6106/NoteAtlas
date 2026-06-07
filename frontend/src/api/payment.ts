import { makeHttpReq } from "@/helper/makeHttpReq";
import { showError } from "@/util/toast-notification";

// ─── Plan types ───────────────────────────────────────────
export type PlanId = "pro" | "premium";

export interface RazorpayOrderResponse {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    plan: { id: string; name: string; priceInr: number; credits: number };
}

export interface VerifyPaymentPayload {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    userId: string;
    planId: PlanId;
}

// ─── Create Razorpay order ────────────────────────────────
export async function createRazorpayOrder(userId: string, planId: PlanId): Promise<RazorpayOrderResponse> {
    const data = await makeHttpReq('POST', 'payment/create-order', { userId, planId }) as RazorpayOrderResponse;
    return data;
}

// ─── Verify payment after checkout ───────────────────────
export async function verifyRazorpayPayment(payload: VerifyPaymentPayload): Promise<{ success: boolean; message: string; credits: number }> {
    const data = await makeHttpReq('POST', 'payment/verify', payload) as { success: boolean; message: string; credits: number };
    return data;
}

// ─── Get user credits + payment status ───────────────────
export const getUserCreditAndPaymentMethod = async (userId: string) => {
    try {
        const data = await makeHttpReq('GET', `payment/user-credits?userId=${userId}`);
        return data;
    } catch (error: any) {
        showError(error?.error?.message || error?.message);
        throw error;
    }
};
