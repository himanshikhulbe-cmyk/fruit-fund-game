import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethodPickerProps {
  amount: number;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  type: "deposit" | "withdraw";
}

const METHODS = [
  { id: "upi", label: "UPI", icon: "📱", desc: "Google Pay, PhonePe, Paytm" },
  { id: "credit", label: "Credit Card", icon: "💳", desc: "Visa, Mastercard" },
  { id: "debit", label: "Debit Card", icon: "🏧", desc: "Any bank debit card" },
  { id: "netbanking", label: "Net Banking", icon: "🏦", desc: "All major banks" },
];

export default function PaymentMethodPicker({ amount, onConfirm, onBack, loading, type }: PaymentMethodPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");

  const isDeposit = type === "deposit";

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
            <p className="text-sm font-bold text-foreground text-center">Choose Payment Method</p>
            <div className="space-y-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selected === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/40 hover:border-muted-foreground/30"
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  </div>
                  {selected === m.id && <span className="text-primary font-bold">✓</span>}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onBack} className="py-3 rounded-xl bg-muted text-foreground font-bold text-sm">
                ← Back
              </button>
              <button
                onClick={() => selected && setStep("confirm")}
                disabled={!selected}
                className={`py-3 rounded-xl font-bold text-sm disabled:opacity-40 ${
                  isDeposit ? "btn-deposit text-primary-foreground" : "btn-withdraw text-destructive-foreground"
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">
                {isDeposit ? "Depositing" : "Withdrawing"}
              </p>
              <p className="text-2xl font-black text-foreground">₹{amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                via {METHODS.find((m) => m.id === selected)?.icon} {METHODS.find((m) => m.id === selected)?.label}
              </p>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">This is a simulation — no real money involved.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep("select")} className="py-3 rounded-xl bg-muted text-foreground font-bold text-sm">
                ← Back
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`py-3 rounded-xl font-bold text-sm disabled:opacity-50 ${
                  isDeposit ? "btn-deposit text-primary-foreground" : "btn-withdraw text-destructive-foreground"
                }`}
              >
                {loading ? "Processing..." : isDeposit ? "Deposit 💰" : "Withdraw 📤"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
