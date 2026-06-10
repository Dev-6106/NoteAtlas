import { useState } from "react";
import { Loader2, Zap, CheckCircle2, Sparkles, Crown } from "lucide-react";
import { BaseModal } from "../base/BaseModal";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { togglePaymentModal } from "@/store/chatSlice";
import { createRazorpayOrder, verifyRazorpayPayment, type PlanId } from "@/api/payment";
import { getUserData } from "@/helper/getUserData";
import { showError, showSuccess } from "@/util/toast-notification";
import { fetchUserCreditAndPayment } from "@/store/creditMenuSlice";

declare global {
    interface Window {
        Razorpay: any;
    }
}

// ─── Load Razorpay script dynamically ─────────────────────
function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

// ─── Plans ────────────────────────────────────────────────
const PLANS = [
    {
        id: "free" as const,
        name: "Starter",
        price: null,
        priceLabel: "Free",
        subtitle: "Included at signup",
        credits: 50,
        description: "Get started with AI notebooks",
        icon: <Zap size={20} />,
        color: "#6b7280",
        features: [
            "50 credits on signup",
            "Unlimited notebooks",
            "No credit expiration",
            "Basic AI chat",
        ],
        isCurrent: true,
    },
    {
        id: "pro" as PlanId,
        name: "Pro",
        price: 499,
        priceLabel: "₹499",
        subtitle: "per purchase",
        credits: 3000,
        description: "For active researchers & students",
        icon: <Sparkles size={20} />,
        color: "#818cf8",
        features: [
            "3,000 credits added",
            "Unlimited notebooks",
            "No credit expiration",
            "Priority AI responses",
            "Summaries, FAQs, Mind Maps",
        ],
        isCurrent: false,
    },
    {
        id: "premium" as PlanId,
        name: "Premium",
        price: 999,
        priceLabel: "₹999",
        subtitle: "per purchase",
        credits: 10000,
        description: "Power users & teams",
        icon: <Crown size={20} />,
        color: "#f59e0b",
        features: [
            "10,000 credits added",
            "All AI features unlocked",
            "Unlimited notebooks",
            "Unlimited documents",
            "No credit expiration",
            "Priority support",
        ],
        isCurrent: false,
        popular: true,
    },
];

export const BuyCreditModal = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { payment } = useSelector((state: RootState) => state.chat);
    const [loading, setLoading] = useState(false);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);

    const handleBuy = async (planId: PlanId, planName: string) => {
        try {
            setLoading(true);
            setActivePlanId(planId);

            const loaded = await loadRazorpayScript();
            if (!loaded) {
                showError("Could not load payment gateway. Please check your internet connection.");
                return;
            }

            const userData = getUserData();
            const orderData = await createRazorpayOrder(userData?._id, planId);
            console.log("=== RAZORPAY ORDER DATA ===", orderData);

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "NoteAtlas",
                description: `${planName} — ${orderData.plan.credits} credits`,
                order_id: orderData.orderId,
                theme: { color: "#6366f1" },
                prefill: {
                    email: userData?.email,
                    name: userData?.name,
                },
                handler: async (response: any) => {
                    try {
                        const verifyResult = await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: userData?._id,
                            planId,
                        });
                        showSuccess(verifyResult.message);
                        dispatch(togglePaymentModal());
                        dispatch(fetchUserCreditAndPayment(userData?._id));
                    } catch {
                        showError("Payment verification failed. Contact support if credits were not added.");
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setActivePlanId(null);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            showError(err?.message || "Failed to initiate payment.");
        } finally {
            setLoading(false);
            setActivePlanId(null);
        }
    };

    return (
        <BaseModal
            open={payment.modal}
            onOpenChange={() => dispatch(togglePaymentModal())}
            title="Buy Credits"
            width={960}
            height={680}
        >
            <div style={{ padding: "8px 16px 24px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "6px 16px", borderRadius: 999,
                        background: "var(--primary-glow)",
                        border: "1px solid var(--primary-border)",
                        marginBottom: 14,
                    }}>
                        <Zap size={13} style={{ color: "var(--primary-brand)" }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-brand)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            Credit Plans
                        </span>
                    </div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 6 }}>
                        Choose Your Plan
                    </h2>
                    <p style={{ color: "var(--text-3)", fontSize: 14 }}>
                        Credits power every AI feature — chat, summaries, mind maps, audio overviews and more.
                    </p>
                </div>

                {/* Plans Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 900, margin: "0 auto" }}>
                    {PLANS.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            loading={loading && activePlanId === plan.id}
                            onBuy={plan.id !== "free" ? () => handleBuy(plan.id as PlanId, plan.name) : undefined}
                        />
                    ))}
                </div>

                {/* Credit info */}
                <div style={{ marginTop: 28, textAlign: "center" }}>
                    <p style={{ fontSize: 12.5, color: "var(--text-4)", lineHeight: 1.7 }}>
                        <strong style={{ color: "var(--text-3)" }}>How credits work:</strong> Chat = 2 credits · Studio tools (Summary, FAQ, Mind Map, etc.) = 5 credits · Audio Overview = 10 credits<br />
                        Payments are one-time credit top-ups, not subscriptions. Processed securely via Razorpay.
                    </p>
                </div>
            </div>
        </BaseModal>
    );
};


interface PlanCardProps {
    plan: typeof PLANS[0];
    loading: boolean;
    onBuy?: () => void;
}

const PlanCard = ({ plan, loading, onBuy }: PlanCardProps) => {
    const isPopular = (plan as any).popular;
    const isFree = plan.id === "free";

    return (
        <div style={{
            position: "relative",
            background: isPopular
                ? "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)"
                : "var(--bg-card)",
            border: isPopular ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--border-default)",
            borderRadius: 20,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            boxShadow: isPopular ? "0 0 40px rgba(99,102,241,0.15)" : "none",
            transform: isPopular ? "scale(1.025)" : "none",
        }}>
            {/* Popular badge */}
            {isPopular && (
                <div style={{
                    position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                    color: "#fff", fontSize: 10.5, fontWeight: 700,
                    padding: "4px 14px", borderRadius: 999,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
                    whiteSpace: "nowrap",
                }}>
                    Most Popular
                </div>
            )}

            {/* Icon + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: `${plan.color}20`,
                    border: `1px solid ${plan.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: plan.color,
                }}>
                    {plan.icon}
                </div>
                <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{plan.name}</p>
                    <p style={{ fontSize: 11.5, color: "var(--text-4)" }}>{plan.description}</p>
                </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-2px" }}>
                        {plan.priceLabel}
                    </span>
                    {plan.price && (
                        <span style={{ fontSize: 12, color: "var(--text-4)" }}>{plan.subtitle}</span>
                    )}
                </div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    marginTop: 6, padding: "3px 10px",
                    borderRadius: 999,
                    background: `${plan.color}15`,
                    border: `1px solid ${plan.color}30`,
                }}>
                    <Zap size={11} style={{ color: plan.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: plan.color }}>
                        {plan.credits.toLocaleString()} credits
                    </span>
                </div>
            </div>

            {/* Features */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {plan.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: isPopular ? "var(--text-2)" : "var(--text-3)" }}>
                        <CheckCircle2 size={13} style={{ color: isPopular ? "var(--primary-brand)" : "var(--text-4)", flexShrink: 0 }} />
                        {f}
                    </li>
                ))}
            </ul>

            {/* CTA Button */}
            {isFree ? (
                <button disabled style={{
                    padding: "11px", borderRadius: 12,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-4)", fontSize: 13, fontWeight: 600,
                    cursor: "not-allowed", opacity: 0.6,
                }}>
                    Current Plan
                </button>
            ) : (
                <button
                    onClick={onBuy}
                    disabled={loading}
                    style={{
                        padding: "12px", borderRadius: 12,
                        background: isPopular
                            ? "linear-gradient(135deg, var(--primary-brand), var(--primary-light))"
                            : "var(--bg-elevated)",
                        border: isPopular ? "none" : "1px solid var(--border-strong)",
                        color: isPopular ? "var(--text-on-primary)" : "var(--text-2)",
                        fontSize: 13.5, fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "all 0.2s",
                        boxShadow: isPopular ? "var(--shadow-primary)" : "none",
                        opacity: loading ? 0.7 : 1,
                    }}
                    onMouseEnter={e => {
                        if (!loading) {
                            (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                >
                    {loading ? (
                        <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Processing…<style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></>
                    ) : (
                        <><Zap size={14} />Buy {plan.name} — {plan.priceLabel}</>
                    )}
                </button>
            )}
        </div>
    );
};

export default BuyCreditModal;
