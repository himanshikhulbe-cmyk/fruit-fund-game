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
  const [step, setStep] = useState<"select" | "details" | "confirm">("select");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [saveCard, setSaveCard] = useState(false);

  const isDeposit = type === "deposit";
  const isCardMethod = selected === "credit" || selected === "debit";

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

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
                onClick={() => selected && setStep(isCardMethod ? "details" : "confirm")}
                disabled={!selected}
                className={`py-3 rounded-xl font-bold text-sm disabled:opacity-40 ${
                  isDeposit ? "btn-deposit text-primary-foreground" : "btn-withdraw text-destructive-foreground"
                }`}
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : step === "details" ? (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <p className="text-sm font-bold text-foreground text-center">Card Details</p>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground mb-0.5 block">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="rounded border-border" />
                <span className="text-xs text-muted-foreground font-semibold">Save card for future (simulation only)</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">⚠️ Simulation only — no real data stored.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep("select")} className="py-3 rounded-xl bg-muted text-foreground font-bold text-sm">
                ← Back
              </button>
              <button
                onClick={() => setStep("confirm")}
                className={`py-3 rounded-xl font-bold text-sm ${
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
              {isCardMethod && cardNumber && (
                <p className="text-xs text-muted-foreground">Card ending ****{cardNumber.replace(/\s/g, "").slice(-4)}</p>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">This is a simulation — no real money involved.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setStep(isCardMethod ? "details" : "select")} className="py-3 rounded-xl bg-muted text-foreground font-bold text-sm">
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
