import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { icon: "🎯", title: "Create a Goal", desc: "Set a savings target — name it, set an amount, pick a deadline." },
  { icon: "💰", title: "Deposit & Grow", desc: "Add money to watch your fruit tree grow. Small deposits add up!" },
  { icon: "🍒", title: "Merge Fruits", desc: "Tap matching fruits to merge them into higher tiers. More value!" },
  { icon: "🪙", title: "Earn Tokens", desc: "Hit milestones at 50%, 70%, 100% to earn tokens for the Market." },
  { icon: "👥", title: "Join Circles", desc: "Create or join savings circles to save with friends & family." },
];

const STORAGE_KEY = "fruitfund_onboarding_done";

export default function OnboardingWalkthrough() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!visible) return null;

  const s = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/60 z-[100] flex items-center justify-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          key={step}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-card rounded-2xl p-6 text-center shadow-float"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-5xl mb-4"
          >
            {s.icon}
          </motion.div>
          <h2 className="text-lg font-black text-foreground mb-2">{s.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">{s.desc}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === step ? "bg-primary w-5" : i < step ? "bg-primary/40" : "bg-muted"}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground font-bold text-sm"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="flex-1 py-2.5 rounded-xl btn-deposit text-primary-foreground font-bold text-sm"
            >
              {step < STEPS.length - 1 ? "Next →" : "Let's Go! 🚀"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
