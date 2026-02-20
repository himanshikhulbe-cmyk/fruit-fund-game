import { useParams, useNavigate } from "react-router-dom";
import { useGoals, useDeleteGoal } from "@/hooks/useGoals";
import { useFruits, useDeposit, useWithdraw, useManualMerge } from "@/hooks/useFruits";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FruitGrid from "@/components/FruitGrid";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import Confetti from "@/components/Confetti";
import GoalMilestones from "@/components/GoalMilestones";

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goals } = useGoals();
  const { data: fruits, isLoading } = useFruits(id);
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const manualMerge = useManualMerge();
  const deleteGoal = useDeleteGoal();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const goal = goals?.find((g) => g.id === id);
  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-muted-foreground font-semibold">Goal not found</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary font-bold text-sm">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
  const isComplete = pct >= 100;

  const handleDeposit = async (amount: number) => {
    await deposit.mutateAsync({
      goalId: goal.id,
      amount,
      existingFruits: fruits ?? [],
    });
    setShowDeposit(false);
    const newTotal = (goal.current_amount + amount);
    if (newTotal >= goal.target_amount && goal.current_amount < goal.target_amount) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleWithdraw = async (amount: number) => {
    await withdraw.mutateAsync({
      goalId: goal.id,
      amount,
      existingFruits: fruits ?? [],
    });
    setShowWithdraw(false);
  };

  const handleMerge = async (fruitAId: string, fruitBId: string) => {
    if (!id || !fruits) return;
    await manualMerge.mutateAsync({
      goalId: id,
      fruitAId,
      fruitBId,
      existingFruits: fruits,
    });
  };

  const handleDelete = async () => {
    if (confirm("Delete this goal? All fruits will be lost.")) {
      await deleteGoal.mutateAsync(goal.id);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8 md:pb-12">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="sky-gradient px-4 pt-6 pb-6 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="text-primary-foreground font-bold text-sm">
            ← Back
          </button>
          <button onClick={handleDelete} className="text-primary-foreground/60 text-xs font-bold">
            Delete
          </button>
        </div>
        <div className="text-center">
          <span className="text-4xl">{goal.icon}</span>
          <h1 className="text-xl font-black text-primary-foreground mt-1">{goal.name}</h1>
          <p className="text-primary-foreground/70 text-sm font-semibold">
            Goal: ₹{goal.target_amount.toLocaleString()}
          </p>
          {goal.deadline && (
            <p className="text-primary-foreground/60 text-xs font-semibold mt-1">
              🗓️ Deadline: {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Content - two column on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-6 md:px-4 md:-mt-3">
        {/* Left column */}
        <div>
          {/* Fruit Grid */}
          <div className="px-4 md:px-0 -mt-3 md:mt-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="card-playful p-4"
            >
              <FruitGrid fruits={fruits ?? []} loading={isLoading} onMerge={handleMerge} merging={manualMerge.isPending} />
            </motion.div>
          </div>

          {/* Progress */}
          <div className="px-4 md:px-0 mt-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card-playful p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-foreground">
                  {isComplete ? "🎉 Goal Complete!" : `${Math.round(pct)}% to Goal`}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${isComplete ? "bg-accent" : "bg-primary"}`}
                />
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 md:px-0 mt-4 grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeposit(true)}
              className="btn-deposit py-4 rounded-xl text-primary-foreground font-bold text-base flex items-center justify-center gap-2"
            >
              <span>💰</span> Deposit
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWithdraw(true)}
              disabled={goal.current_amount === 0}
              className="btn-withdraw py-4 rounded-xl text-destructive-foreground font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>📤</span> Withdraw
            </motion.button>
          </div>

          {/* Fruit Legend */}
          <div className="px-4 md:px-0 mt-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card-playful p-4"
            >
              <h3 className="text-sm font-bold text-foreground mb-2">Fruit Tiers</h3>
              <div className="flex items-center justify-between text-xs">
                {[
                  { emoji: "🍒", val: "₹25" },
                  { emoji: "🍓", val: "₹50" },
                  { emoji: "🍊", val: "₹100" },
                  { emoji: "🥭", val: "₹200" },
                  { emoji: "🍈", val: "₹400" },
                ].map((f) => (
                  <div key={f.emoji} className="text-center">
                    <div className="text-2xl">{f.emoji}</div>
                    <div className="text-muted-foreground font-semibold mt-1">{f.val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Savings Pace */}
          {goal.deadline && !isComplete && (() => {
            const now = new Date();
            const deadlineDate = new Date(goal.deadline);
            const msLeft = deadlineDate.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
            const isPastDeadline = msLeft <= 0;

            const totalMs = deadlineDate.getTime() - new Date(goal.created_at).getTime();
            const totalWeeks = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24 * 7)));
            const perWeek = Math.floor(goal.target_amount / totalWeeks);
            const totalMonths = Math.max(1, Math.round(totalMs / (1000 * 60 * 60 * 24 * 30.44)));
            const perMonth = Math.round(perWeek * (totalWeeks / totalMonths));
            const remaining = goal.target_amount - goal.current_amount;

            const totalDuration = deadlineDate.getTime() - new Date(goal.created_at).getTime();
            const elapsed = now.getTime() - new Date(goal.created_at).getTime();
            const expectedPct = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 100;
            const onTrack = pct >= expectedPct - 5;

            return (
              <div className="px-4 md:px-0 mt-4 md:mt-0">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="card-playful p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">📊 Savings Pace</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isPastDeadline
                        ? "bg-destructive/15 text-destructive"
                        : onTrack
                        ? "bg-accent/15 text-accent"
                        : "bg-chart-4/15 text-chart-4"
                    }`}>
                      {isPastDeadline ? "⚠️ Overdue" : onTrack ? "✅ On Track" : "⏰ Behind"}
                    </span>
                  </div>

                  {isPastDeadline ? (
                    <p className="text-xs text-muted-foreground">
                      Deadline has passed. ₹{remaining.toLocaleString()} still needed.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-black text-foreground">{daysLeft}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Days Left</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-primary">₹{perWeek.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Per Week</p>
                      </div>
                      <div>
                        <p className="text-lg font-black text-primary">₹{perMonth.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Per Month</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })()}

          {/* Weekly Milestones */}
          {goal.deadline && !isComplete && (
            <div className="md:[&>div]:px-0">
              <GoalMilestones goal={goal} />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeposit && (
          <DepositModal
            onClose={() => setShowDeposit(false)}
            onDeposit={handleDeposit}
            loading={deposit.isPending}
          />
        )}
        {showWithdraw && (
          <WithdrawModal
            onClose={() => setShowWithdraw(false)}
            onWithdraw={handleWithdraw}
            loading={withdraw.isPending}
            maxAmount={goal.current_amount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
