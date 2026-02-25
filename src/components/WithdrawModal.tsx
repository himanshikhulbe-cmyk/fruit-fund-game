import { useState } from "react";
import { motion } from "framer-motion";
import PaymentMethodPicker from "@/components/PaymentMethodPicker";

interface WithdrawModalProps {
  onClose: () => void;
  onWithdraw: (amount: number) => void;
  loading: boolean;
  maxAmount: number;
  isFunFund?: boolean;
  goalName?: string;
  goalIcon?: string;
  goalProgress?: number; // 0-100
  goalRemaining?: number;
}

export default function WithdrawModal({
  onClose,
  onWithdraw,
  loading,
  maxAmount,
  isFunFund,
  goalName,
  goalIcon,
  goalProgress = 0,
  goalRemaining = 0,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"amount" | "motivation" | "needwant" | "wantnudge" | "confirm" | "payment">(
    "amount"
  );
  const [reason, setReason] = useState<"need" | "want" | null>(null);

  const parsedAmount = parseInt(amount) || 0;

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0 || parsedAmount > maxAmount) return;
    if (isFunFund) {
      setStep("payment");
    } else {
      setStep("motivation");
    }
  };

  const handleMotivationContinue = () => {
    setStep("needwant");
  };

  const handleReasonSelect = (r: "need" | "want") => {
    setReason(r);
    if (r === "want") {
      setStep("wantnudge");
    } else {
      setStep("payment");
    }
  };

  const handleWantContinue = () => {
    setStep("payment");
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

        {step === "payment" ? (
          <PaymentMethodPicker
            amount={parsedAmount}
            onConfirm={() => onWithdraw(parsedAmount)}
            onBack={() => setStep(isFunFund ? "amount" : reason === "want" ? "wantnudge" : "needwant")}
            loading={loading}
            type="withdraw"
          />
        ) : step === "wantnudge" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-chart-4/10 border border-chart-4/20 rounded-xl p-5 text-center space-y-2">
              <p className="text-3xl">🧠</p>
              <p className="text-sm font-black text-foreground">Impulse fades. Goals compound.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Wants feel urgent now, but your future self will thank you for staying the course.
              </p>
              <p className="text-xs text-muted-foreground italic mt-2">
                "The best time to save was yesterday. The next best time is now."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-3 rounded-xl bg-accent/15 border border-accent/30 text-foreground font-bold text-sm"
              >
                Keep Saving 💪
              </button>
              <button
                onClick={handleWantContinue}
                className="py-3 rounded-xl bg-muted text-muted-foreground font-bold text-sm"
              >
                Continue anyway
              </button>
            </div>
          </motion.div>
        ) : step === "motivation" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center space-y-2">
              <p className="text-3xl">{goalIcon || "🎯"}</p>
              <p className="text-lg font-black text-foreground">{goalName || "Your Goal"}</p>
              <div className="flex justify-center gap-6 mt-2">
                <div>
                  <p className="text-xl font-black text-primary">{Math.round(goalProgress)}%</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">Progress</p>
                </div>
                <div>
                  <p className="text-xl font-black text-foreground">₹{goalRemaining.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">Remaining</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Breaking now means restarting momentum. Are you sure?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-3 rounded-xl bg-accent/15 border border-accent/30 text-foreground font-bold text-sm"
              >
                Keep Saving 💪
              </button>
              <button
                onClick={handleMotivationContinue}
                className="py-3 rounded-xl bg-muted text-muted-foreground font-bold text-sm"
              >
                Continue →
              </button>
            </div>
          </motion.div>
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
            <button
              onClick={() => {
                setStep("motivation");
                setReason(null);
              }}
              className="w-full py-2 text-xs text-muted-foreground font-semibold"
            >
              ← Back
            </button>
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
