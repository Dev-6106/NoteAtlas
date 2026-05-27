import { Zap } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { togglePaymentModal } from "@/store/chatSlice";

export default function CreditMenu() {
  const dispatch = useAppDispatch();
  const { result, loading } = useAppSelector((state) => state.creditMenu);

  // Note: We removed the duplicate fetchUserCreditAndPayment dispatch here.
  // ChatPage.tsx already handles the global data fetching on mount.

  return (
    <button
      onClick={() => dispatch(togglePaymentModal())}
      className="w-full flex items-center justify-between px-3 py-2.5 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="View or purchase credits"
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
          <Zap className="w-3 h-3 text-primary" />
        </div>
        <span className="text-sm font-medium text-foreground">Credits</span>
      </div>

      {loading ? (
        <div className="h-5 w-12 bg-primary/20 animate-pulse rounded-md" />
      ) : (
        <span className="text-sm font-bold text-primary tabular-nums tracking-tight">
          {result?.credits?.toLocaleString() || 0}
        </span>
      )}
    </button>
  );
}
