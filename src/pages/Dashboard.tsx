import { useState } from "react";
import { useGoals, useCreateGoal } from "@/hooks/useGoals";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import CreateGoalModal from "@/components/CreateGoalModal";

const GOAL_ICONS: Record<string, string> = {
  Education: "📚",
  Travel: "✈️",
  Healthcare: "🏥",
  Gadgets: "📱",
  Emergency: "🆘",
  Fun: "🎮",
};

export default function Dashboard() {
  const { data: goals, isLoading } = useGoals();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const totalSavings = goals?.reduce((s, g) => s + g.current_amount, 0) ?? 0;
  const canCreate = (goals?.length ?? 0) < 3;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sky-gradient px-4 pt-6 pb-8 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍍</span>
            <h1 className="text-2xl font-black text-primary-foreground">FruitFund</h1>
          </div>
          <button
            onClick={signOut}
            className="text-primary-foreground/70 text-xs font-bold hover:text-primary-foreground transition-colors"
          >
            Logout
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary/90 rounded-xl px-5 py-3 shadow-float"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-primary-foreground/70 text-xs font-semibold">Total Savings</p>
              <p className="text-primary-foreground text-2xl font-black">₹{totalSavings.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goals */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Your Goals</h2>
          <span className="text-xs font-semibold text-muted-foreground">
            {goals?.length ?? 0}/3 goals
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin text-3xl">🍊</div>
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {goals.map((goal, i) => {
                const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/goal/${goal.id}`)}
                    className="card-playful p-4 cursor-pointer hover:shadow-float transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{goal.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-sm font-black text-primary">
                        {Math.round(pct)}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-muted-foreground font-semibold">No goals yet</p>
            <p className="text-muted-foreground text-sm">Create your first savings goal!</p>
          </motion.div>
        )}

        {/* Stats */}
        {goals && goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3 mt-6"
          >
            <div className="card-playful p-4 text-center">
              <p className="text-2xl font-black text-foreground">{goals.length}</p>
              <p className="text-xs text-muted-foreground font-semibold">Active Goals</p>
            </div>
            <div className="card-playful p-4 text-center">
              <p className="text-2xl font-black text-foreground">₹{totalSavings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground font-semibold">Total Saved</p>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav onAddGoal={() => canCreate && setShowCreate(true)} canCreate={canCreate} />

      <AnimatePresence>
        {showCreate && (
          <CreateGoalModal onClose={() => setShowCreate(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
