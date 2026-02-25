import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/hooks/useGoals";
import { useState, useEffect, useMemo } from "react";

interface SavingsNudgeBannerProps {
  goals: Goal[];
}

const ENCOURAGEMENTS = [
  "Small catch-ups build big wins. 💪",
  "You're still in control. 🎯",
  "Every rupee counts toward your dream. 🌟",
  "Progress, not perfection. 🌱",
];

function getDailyTarget(goal: Goal): { daily: number; behind: boolean; missedAmount: number } | null {
  if (!goal.deadline || goal.is_fun_fund) return null;
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const created = new Date(goal.created_at);
  if (deadline <= now) return null;

  const remaining = goal.target_amount - goal.current_amount;
  if (remaining <= 0) return null;

  const daysLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(1, Math.ceil((deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, totalDays - daysLeft);

  const expectedByNow = daysElapsed > 0 ? Math.round((goal.target_amount / totalDays) * daysElapsed) : 0;
  const behind = goal.current_amount < expectedByNow * 0.95; // 5% grace
  const missedAmount = Math.max(0, expectedByNow - goal.current_amount);
  const daily = Math.ceil(remaining / daysLeft);

  return { daily, behind, missedAmount };
}

export default function SavingsNudgeBanner({ goals }: SavingsNudgeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const nudge = useMemo(() => {
    for (const goal of goals) {
      const result = getDailyTarget(goal);
      if (result && result.behind) {
        return { goal, ...result };
      }
    }
    return null;
  }, [goals]);

  const encouragement = useMemo(
    () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
    []
  );

  // Reset dismissed when nudge goal changes
  useEffect(() => { setDismissed(false); }, [nudge?.goal.id]);

  if (!nudge || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-4 mb-3 rounded-xl bg-chart-4/10 border border-chart-4/20 p-3 relative"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-muted-foreground text-xs font-bold"
        >
          ✕
        </button>
        <p className="text-xs font-bold text-foreground pr-4">
          📊 {nudge.goal.icon} {nudge.goal.name}: You're ₹{nudge.missedAmount.toLocaleString()} behind.
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Save <span className="font-bold text-primary">₹{nudge.daily.toLocaleString()}/day</span> to stay on track.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 italic">{encouragement}</p>
      </motion.div>
    </AnimatePresence>
  );
}
