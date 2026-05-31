import React, { useState } from "react";
import { Loader2, Star, Check, Zap, CheckCircle2 } from "lucide-react";
import { BaseModal } from "../base/BaseModal";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { togglePaymentModal } from "@/store/chatSlice";
import { buyCredit } from "@/api/payment";
import { getUserData } from "@/helper/getUserData";
import { showError, showSuccess } from "@/util/toast-notification";
import { fetchUserCreditAndPayment } from "@/store/creditMenuSlice";


export const BuyCreditModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { payment } = useSelector((state: RootState) => state.chat);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (amount: number) => {
    try {
      const userData = getUserData();
      setLoading(true);
      const res = await buyCredit({
        userId: userData?._id as string,
        amount: amount,
        email: userData?.email,
      });
      showSuccess(res?.message);
      dispatch(togglePaymentModal());
      dispatch(fetchUserCreditAndPayment(userData?._id));
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      showError("❌ Failed to purchase credit.");
    }
  };

  return (
    <BaseModal
      open={payment.modal}
      onOpenChange={() => dispatch(togglePaymentModal())}
      title="Buy Credits"
      width={900}
      height={700}
    >
      <div style={{ padding: 16, marginTop: 16 }}>
        <PricingPlan onSubmit={onSubmit} loading={loading} />
      </div>
    </BaseModal>
  );
};


const perks = {
  free: [
    "Up to 5 documents per notebook",
    "Max 10 pages per upload",
    "Basic chat with AI",
    "Community support",
  ],
  starter: [
    "Up to 20 documents per notebook",
    "Max 50 pages per upload",
    "Smarter summarization & citations",
    "Priority chat speed",
  ],
  creator: [
    "Unlimited documents",
    "Upload long PDFs (300+ pages)",
    "Cross-notebook reasoning",
    "Advanced knowledge graphs",
    "Team collaboration access",
    "Export to Notion / Google Docs",
  ],
};

const PricingPlan = ({ onSubmit, loading }: { onSubmit: (amount: number) => void, loading: boolean }) => {
  return (
    <section style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: "#f1f5f9",
          letterSpacing: "-1px", marginBottom: 8,
        }}>
          Choose Your Plan
        </h1>
        <p style={{ color: "#64748b", fontSize: 15 }}>
          Unlock more AI-powered research and note capabilities.
        </p>
      </div>

      {/* Tiers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        maxWidth: 900,
        margin: "0 auto",
      }}>
        {/* Free Tier */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: 24,
          backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column",
          transition: "all 0.2s",
        }}>
          <p style={{
            color: "#94a3b8", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Free
          </p>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-2px" }}>$0</span>
            <span style={{ color: "#64748b", fontSize: 14, marginLeft: 4 }}>Forever free</span>
          </div>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>
            For individuals exploring AI notebooks.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {perks.free.map((perk, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                <CheckCircle2 size={15} style={{ color: "#4b5563", flexShrink: 0, marginTop: 1 }} />
                {perk}
              </li>
            ))}
          </ul>
          <button
            disabled
            style={{
              marginTop: "auto",
              padding: "11px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#475569", fontSize: 13, fontWeight: 600,
              cursor: "not-allowed", opacity: 0.7,
            }}
          >
            Current Plan
          </button>
        </div>

        {/* Starter Tier */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20, padding: 24,
          backdropFilter: "blur(10px)",
          display: "flex", flexDirection: "column",
          transition: "all 0.2s",
        }}>
          <p style={{
            color: "#94a3b8", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Starter
          </p>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-2px" }}>$5</span>
            <span style={{ color: "#64748b", fontSize: 14, marginLeft: 4 }}>per month</span>
          </div>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>
            For hobbyists organizing research or projects.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {perks.starter.map((perk, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                <CheckCircle2 size={15} style={{ color: "#4b5563", flexShrink: 0, marginTop: 1 }} />
                {perk}
              </li>
            ))}
          </ul>
          <button
            onClick={() => onSubmit(5)}
            disabled={loading}
            style={{
              marginTop: "auto",
              padding: "11px", borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8", fontSize: 13, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            Subscribe
          </button>
        </div>

        {/* Creator Tier */}
        <div style={{
          position: "relative",
          background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)",
          border: "1px solid rgba(99,102,241,0.5)",
          borderRadius: 20, padding: 24,
          backdropFilter: "blur(16px)",
          display: "flex", flexDirection: "column",
          boxShadow: "0 0 60px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.3)",
          transform: "scale(1.03)",
          transition: "all 0.2s",
        }}>
          {/* Badge */}
          <div style={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            background: "linear-gradient(90deg,#f59e0b,#ef4444)",
            color: "#fff", fontSize: 11, fontWeight: 700,
            padding: "4px 14px", borderRadius: 999,
            letterSpacing: "0.08em", textTransform: "uppercase",
            boxShadow: "0 4px 12px rgba(245,158,11,0.4)",
          }}>
            Most Popular
          </div>

          <p style={{
            color: "#94a3b8", fontSize: 12, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 8,
          }}>
            Creator
          </p>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", gap: 8 }}>
            <span style={{ color: "#475569", textDecoration: "line-through", fontSize: 14 }}>$22</span>
            <span style={{ fontSize: 40, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-2px" }}>$20</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e" }}>50 credits bonus</span>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
            For creators making premium knowledge content.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {perks.creator.map((perk, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#c7d2fe" }}>
                <CheckCircle2 size={15} style={{ color: "#818cf8", flexShrink: 0, marginTop: 1 }} />
                {perk}
              </li>
            ))}
          </ul>
          <button
            disabled={loading}
            onClick={() => onSubmit(20)}
            style={{
              marginTop: "auto",
              padding: "13px", borderRadius: 12,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff", fontSize: 14, fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 8, marginTop: 16, color: "#818cf8",
        }}>
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Processing payment...</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Credit Info */}
      <CreditInfoCard />
    </section>
  );
};


const CreditInfoCard = () => (
  <div style={{ maxWidth: 600, margin: "32px auto 0" }}>
    <div style={{
      borderRadius: 20, padding: 24,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(10px)",
      textAlign: "center",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, marginBottom: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Zap size={16} style={{ color: "#818cf8" }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>
          Credit Conversion
        </h3>
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8" }}>
        <span style={{ color: "#818cf8", fontWeight: 700 }}>1 USD = 10 Credits</span>
      </p>
      <p style={{ fontSize: 13, color: "#475569", marginTop: 8, lineHeight: 1.6 }}>
        Credits are used for AI reasoning, doc uploads, and advanced features.
        Upgrade to unlock higher credit limits, longer PDF uploads, and
        multi-document analysis.
      </p>
    </div>
  </div>
);


export default BuyCreditModal;
