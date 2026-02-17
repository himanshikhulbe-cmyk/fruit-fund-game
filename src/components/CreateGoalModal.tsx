import { useState } from "react";
import { useCreateGoal } from "@/hooks/useGoals";
import { motion } from "framer-motion";

const GOAL_PRESETS = [
  { name: "Education", icon: "📚" },
  { name: "Travel", icon: "✈️" },
  { name: "Healthcare", icon: "🏥" },
  { name: "Gadgets", icon: "📱" },
  { name: "Emergency", icon: "🆘" },
  { name: "Fun", icon: "🎮" },
];

interface CreateGoalModalProps {
  onClose: () => void;
}

export default function CreateGoalModal({ onClose }: CreateGoalModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [target, setTarget] = useState("1000");
  const createGoal = useCreateGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(target);
    if (!name || targetNum < 100) return;
    await createGoal.mutateAsync({ name, target_amount: targetNum, icon });
    onClose();
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
        <h2 className="text-lg font-black text-foreground mb-4">New Savings Goal 🎯</h2>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {GOAL_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => { setName(p.name); setIcon(p.icon); }}
              className={`p-2 rounded-lg text-sm font-bold text-center transition-all ${
                name === p.name
                  ? "bg-primary text-primary-foreground shadow-playful"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <br />
              {p.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal name"
            required
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Target Amount (₹)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              min={100}
              required
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={createGoal.isPending}
            className="w-full py-3 rounded-xl btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50"
          >
            {createGoal.isPending ? "Creating..." : "Create Goal 🌱"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
