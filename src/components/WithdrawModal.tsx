import { useState } from "react";
import { motion } from "framer-motion";

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number) => void;
  loading: boolean;
  maxAmount: number;
  isFunFund?: boolean;
}

export default function WithdrawModal({ onClose, onWithdraw, loading, maxAmount, isFunFund }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"amount" | "needwant" | "confirm">(isFunFund ? "amount" : "amount");
  const [reason, setReason] = useState<"need" | "want" | null>(null);

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount);
    if (num <= 0 || num > maxAmount) return;
    if (isFunFund) {
      // Skip need/want for fun fund — go straight to withdrawal
      onWithdraw(num);
    } else {
      setStep("needwant");
    }
  };

  const handleReasonSelect = (r: "need" | "want") => {
    setReason(r);
    setStep("confirm");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-t-2xl p-6"
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-black text-foreground mb-1">
          {isFunFund ? "Spend from Fun Fund 🎉" : "Withdraw 📤"}
        </h2>
        <p className="text-xs text-muted-foreground font-semibold mb-4">
          Available: ₹{maxAmount.toLocaleString()}
        </p>

        {step === "confirm" ? (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-destructive">⚠️ This will downgrade your fruits</p>
              <p className="text-xs text-muted-foreground mt-1">
                Withdrawing ₹{parseInt(amount).toLocaleString()} ({reason === "need" ? "a need" : "a want"}) will remove or downgrade your highest fruits.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep("needwant")} className="py-3 rounded-xl bg-muted text-foreground font-bold text-sm">Cancel</button>
              <button onClick={() => onWithdraw(parseInt(amount))} disabled={loading} className="py-3 rounded-xl btn-withdraw text-destructive-foreground font-bold text-sm disabled:opacity-50">
                {loading ? "..." : "Confirm"}
              </button>
            </div>
          </div>
        ) : step === "needwant" ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground text-center">Is this withdrawal a need or a want?</p>
            <p className="text-xs text-muted-foreground text-center">Think carefully before spending your savings 💭</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleReasonSelect("need")}
                className="py-4 rounded-xl bg-accent/15 border-2 border-accent/30 text-foreground font-bold text-sm flex flex-col items-center gap-1 hover:border-accent transition-colors"
              >
                <span className="text-2xl">✅</span>
                <span>It's a Need</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Essential expense</span>
              </button>
              <button
                onClick={() => handleReasonSelect("want")}
                className="py-4 rounded-xl bg-chart-4/15 border-2 border-chart-4/30 text-foreground font-bold text-sm flex flex-col items-center gap-1 hover:border-chart-4 transition-colors"
              >
                <span className="text-2xl">🛍️</span>
                <span>It's a Want</span>
                <span className="text-[10px] text-muted-foreground font-semibold">Nice to have</span>
              </button>
            </div>
            <button onClick={() => { setStep("amount"); setReason(null); }} className="w-full py-2 text-xs text-muted-foreground font-semibold">← Back</button>
          </div>
        ) : (
          <form onSubmit={handleAmountSubmit} className="space-y-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={maxAmount}
              placeholder="Enter amount"
              required
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-destructive"
            />
            <button
              type="submit"
              disabled={!amount}
              className={`w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50 ${
                isFunFund
                  ? "btn-deposit text-primary-foreground"
                  : "btn-withdraw text-destructive-foreground"
              }`}
            >
              {isFunFund ? "Spend 🎉" : "Continue"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
