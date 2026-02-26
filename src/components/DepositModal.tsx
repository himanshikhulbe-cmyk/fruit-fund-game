import { useState } from "react";
import { motion } from "framer-motion";
import PaymentMethodPicker from "@/components/PaymentMethodPicker";

interface DepositModalProps {
  onClose: () => void;
  onDeposit: (amount: number) => void;
  loading: boolean;
  evolutionLabel?: string;
  evolutionStage?: number;
  fruitTierEmoji?: string;
  fruitTierName?: string;
}

const QUICK_AMOUNTS = [25, 50, 100, 200];

export default function DepositModal({ onClose, onDeposit, loading, evolutionLabel, evolutionStage, fruitTierEmoji, fruitTierName }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"amount" | "payment">("amount");

  const parsedAmount = parseInt(amount) || 0;

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount < 10 || parsedAmount > 200) return;
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
        <h2 className="text-lg font-black text-foreground mb-1">Deposit 💰</h2>
        <p className="text-xs text-muted-foreground font-semibold mb-4">₹10 – ₹200 per deposit</p>

        {step === "payment" ? (
          <PaymentMethodPicker
            amount={parsedAmount}
            onConfirm={() => onDeposit(parsedAmount)}
            onBack={() => setStep("amount")}
            loading={loading}
            type="deposit"
          />
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    amount === String(q) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  ₹{q}
                </button>
              ))}
            </div>

            <form onSubmit={handleAmountSubmit} className="space-y-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={10}
                max={200}
                placeholder="Enter amount"
                required
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full py-3 rounded-xl btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50"
              >
                Continue →
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
