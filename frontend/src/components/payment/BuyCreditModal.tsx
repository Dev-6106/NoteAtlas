import { useState } from "react";
import { Loader2, Star, Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { togglePaymentModal } from "@/store/chatSlice";
import { buyCredit } from "@/api/payment";
import { getUserData } from "@/helper/getUserData";
import { showError, showSuccess } from "@/util/toast-notification";
import { fetchUserCreditAndPayment } from "@/store/creditMenuSlice";
import { BaseModal } from "@/components/base/BaseModal";

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

export default function BuyCreditModal() {
  const dispatch = useAppDispatch();
  const { payment } = useAppSelector((state) => state.chat);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (amount: number) => {
    try {
      const userData = getUserData();
      if (!userData?._id) throw new Error("No user data");
      
      setLoading(true);
      const res = await buyCredit({
        userId: userData._id,
        amount,
        email: userData.email || "",
      });
      
      if (res?.message) showSuccess(res.message);
      dispatch(fetchUserCreditAndPayment(userData._id));
      dispatch(togglePaymentModal());
    } catch (err) {
      console.error(err);
      showError("Failed to purchase credit.");
    } finally {
      setLoading(false);
    }
  };

  if (!payment.modal) return null;

  return (
    <BaseModal
      open={payment.modal}
      onOpenChange={(isOpen) => !isOpen && dispatch(togglePaymentModal())}
      title="Upgrade Plan"
      width={900}
      height={750}
      footer={null}
    >
      <div className="p-4 sm:p-6 text-foreground">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Choose Your Plan</h1>
          <p className="text-muted-foreground text-sm">
            Unlock more AI-powered research and note capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6 flex flex-col hover:bg-secondary/50 transition-colors">
            <div className="mb-4">
              <h3 className="font-semibold text-muted-foreground">Free</h3>
              <p className="text-3xl font-bold mt-1 text-foreground">$0</p>
              <p className="text-xs text-muted-foreground">Forever free</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">For individuals exploring AI notebooks.</p>
            <ul className="text-sm space-y-3 mb-8 flex-1">
              {perks.free.map((perk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-2.5 rounded-xl bg-secondary text-muted-foreground font-medium cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Starter Tier */}
          <div className="rounded-2xl border border-border bg-background p-6 flex flex-col hover:border-primary/50 transition-colors shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground">Starter</h3>
              <p className="text-3xl font-bold mt-1 text-foreground">$5</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">For hobbyists organizing research or projects.</p>
            <ul className="text-sm space-y-3 mb-8 flex-1">
              {perks.starter.map((perk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onSubmit(5)} 
              disabled={loading} 
              className="w-full py-2.5 rounded-xl border border-border hover:bg-secondary text-foreground font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
            </button>
          </div>

          {/* Creator Tier */}
          <div className="relative rounded-2xl border-2 border-primary bg-primary/5 p-6 flex flex-col shadow-glow group">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-current" /> Most Popular
            </div>
            <div className="mb-4 mt-2">
              <h3 className="font-semibold text-primary">Creator</h3>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-muted-foreground line-through text-sm">$22</span>
                <p className="text-3xl font-bold text-foreground">$20</p>
              </div>
              <p className="text-xs text-emerald-500 font-semibold mt-1">50 credits bonus</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">For creators making premium knowledge content.</p>
            <ul className="text-sm space-y-3 mb-8 flex-1">
              {perks.creator.map((perk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-foreground">{perk}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => onSubmit(20)} 
              disabled={loading} 
              className="w-full py-2.5 rounded-xl bg-gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
            </button>
          </div>
        </div>
        
        {/* Credit Info */}
        <div className="max-w-2xl mx-auto mt-8 surface p-4 rounded-xl border border-primary/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl">💳</span>
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Credit Conversion</h4>
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">1 USD = 10 Credits.</span> Credits are used for AI reasoning, uploading massive documents, and generating premium mind maps and audio briefs.
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
