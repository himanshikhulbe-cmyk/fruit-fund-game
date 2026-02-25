import { useParams, useNavigate } from "react-router-dom";
import { useGoals, useDeleteGoal } from "@/hooks/useGoals";
import { useFruits, useDeposit, useWithdraw, useManualMerge } from "@/hooks/useFruits";
import { useGoalImages, getGoalImageUrl } from "@/hooks/useGoalImages";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FruitGrid from "@/components/FruitGrid";
import DepositModal from "@/components/DepositModal";
import WithdrawModal from "@/components/WithdrawModal";
import Confetti from "@/components/Confetti";
import GoalMilestones from "@/components/GoalMilestones";
import FruitBreakOverlay from "@/components/FruitBreakOverlay";
import WhyIStartedModal from "@/components/WhyIStartedModal";
import EditGoalModal from "@/components/EditGoalModal";
import MysteryFruitToast from "@/components/MysteryFruitToast";
import { getGoalFruitTiers } from "@/utils/fruitLogic";

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goals } = useGoals();
  const { data: fruits, isLoading } = useFruits(id);
  const { data: goalImages } = useGoalImages(id);
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const manualMerge = useManualMerge();
  const deleteGoal = useDeleteGoal();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [breakOverlay, setBreakOverlay] = useState<{ tier: number; amount: number } | null>(null);
  const [showWhyStarted, setShowWhyStarted] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [mysteryToast, setMysteryToast] = useState<{ visible: boolean; type: string }>({ visible: false, type: "" });

  const goal = goals?.find((g) => g.id === id);
  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-muted-foreground font-semibold">Goal not found</p>
          <button onClick={() => navigate("/")} className="mt-4 text-primary font-bold text-sm">← Back</button>
        </div>
      </div>
    );
  }

  const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
  const isComplete = pct >= 100;
  const fruitTiers = getGoalFruitTiers(goal.custom_fruit_values, goal.custom_fruit_emojis);

  const handleDeposit = async (amount: number) => {
    const result = await deposit.mutateAsync({
      goalId: goal.id,
      amount,
      existingFruits: fruits ?? [],
      customFruitValues: goal.custom_fruit_values,
    });
    setShowDeposit(false);

    // Mystery fruit check
    if (result.mysteryFruit) {
      setMysteryToast({ visible: true, type: result.mysteryFruit.special_type ?? "" });
      setTimeout(() => setMysteryToast({ visible: false, type: "" }), 4000);
    }

    const newTotal = goal.current_amount + amount;
    if (newTotal >= goal.target_amount && goal.current_amount < goal.target_amount) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleWithdraw = async (amount: number) => {
    const sorted = [...(fruits ?? [])].filter((f) => !f.is_special).sort((a, b) => b.tier - a.tier);
    const affectedTier = sorted.length > 0 ? sorted[0].tier : 1;

    setShowWithdraw(false);
    setBreakOverlay({ tier: affectedTier, amount });
    setIsWithdrawing(true);

    const hasMotivation = !goal.is_fun_fund && (!!goal.motivation_text || (goalImages && goalImages.length > 0));
    await new Promise((r) => setTimeout(r, hasMotivation ? 4000 : 1800));

    await withdraw.mutateAsync({
      goalId: goal.id,
      amount,
      existingFruits: fruits ?? [],
      customFruitValues: goal.custom_fruit_values,
    });
    setIsWithdrawing(false);
    setBreakOverlay(null);
  };

  const handleMerge = async (fruitAId: string, fruitBId: string) => {
    if (!id || !fruits) return;
    await manualMerge.mutateAsync({
      goalId: id,
      fruitAId,
      fruitBId,
      existingFruits: fruits,
      customFruitValues: goal.custom_fruit_values,
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
      <FruitBreakOverlay
        visible={!!breakOverlay}
        tier={breakOverlay?.tier ?? 1}
        amount={breakOverlay?.amount ?? 0}
        motivationText={goal.motivation_text}
        motivationImages={goalImages?.map((img) => getGoalImageUrl(img.image_path))}
        customFruitValues={goal.custom_fruit_values}
        customFruitEmojis={goal.custom_fruit_emojis}
        isFunFund={goal.is_fun_fund}
      />
      <MysteryFruitToast
        visible={mysteryToast.visible}
        specialType={mysteryToast.type}
        onClose={() => setMysteryToast({ visible: false, type: "" })}
      />

      {/* Header */}
      <div className="sky-gradient px-4 pt-6 pb-6 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="text-primary-foreground font-bold text-sm">← Back</button>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowEdit(true)} className="text-primary-foreground/80 text-xs font-bold">✏️ Edit</button>
            <button onClick={handleDelete} className="text-primary-foreground/60 text-xs font-bold">Delete</button>
          </div>
        </div>
        <div className="text-center">
          <span className="text-4xl">{goal.icon}</span>
          <h1 className="text-xl font-black text-primary-foreground mt-1">{goal.name}</h1>
          {goal.is_fun_fund && (
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
              🎉 No Pressure Fund
            </span>
          )}
          {!goal.is_fun_fund && (
            <p className="text-primary-foreground/70 text-sm font-semibold">
              Goal: ₹{goal.target_amount.toLocaleString()}
            </p>
          )}
          {goal.deadline && (
            <p className="text-primary-foreground/60 text-xs font-semibold mt-1">
              🗓️ Deadline: {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 md:px-4 md:-mt-3">
        <div>
          {/* Fruit Grid */}
          <div className="px-4 md:px-0 -mt-3 md:mt-0">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-playful p-4">
              <FruitGrid
                fruits={fruits ?? []}
                loading={isLoading}
                onMerge={handleMerge}
                merging={manualMerge.isPending}
                withdrawing={isWithdrawing}
                customFruitValues={goal.custom_fruit_values}
                customFruitEmojis={goal.custom_fruit_emojis}
              />
            </motion.div>
          </div>

          {/* Progress (hide for fun fund) */}
          {!goal.is_fun_fund && (
            <div className="px-4 md:px-0 mt-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card-playful p-4">
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
          )}

          {/* Fun fund just shows total */}
          {goal.is_fun_fund && (
            <div className="px-4 md:px-0 mt-4">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card-playful p-4 text-center">
                <p className="text-xs text-muted-foreground font-semibold">Available Balance</p>
                <p className="text-2xl font-black text-foreground">₹{goal.current_amount.toLocaleString()}</p>
              </motion.div>
            </div>
          )}

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

          {/* Why I Started button */}
          {!goal.is_fun_fund && (
            <div className="px-4 md:px-0 mt-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowWhyStarted(true)}
                className="w-full py-3 rounded-xl bg-secondary/15 border border-secondary/30 text-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary/25 transition-colors"
              >
                <span>🪞</span> Why I Started?
              </motion.button>
            </div>
          )}

          {/* Fruit Legend */}
          <div className="px-4 md:px-0 mt-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card-playful p-4">
              <h3 className="text-sm font-bold text-foreground mb-2">Fruit Tiers</h3>
              <div className="flex items-center justify-between text-xs">
                {fruitTiers.map((f) => (
                  <div key={f.tier} className="text-center">
                    <div className="text-2xl">{f.emoji}</div>
                    <div className="text-muted-foreground font-semibold mt-1">₹{f.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Adaptive Savings / Pace (not for fun fund) */}
          {!goal.is_fun_fund && goal.deadline && !isComplete && (() => {
            const now = new Date();
            const deadlineDate = new Date(goal.deadline);
            const created = new Date(goal.created_at);
            const msLeft = deadlineDate.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
            const isPastDeadline = msLeft <= 0;

            const remaining = goal.target_amount - goal.current_amount;
            const totalMs = deadlineDate.getTime() - created.getTime();
            const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
            const daysElapsed = Math.max(0, totalDays - daysLeft);

            // Adaptive recalculation
            const adaptiveDaily = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining;
            const adaptiveWeekly = Math.min(remaining, adaptiveDaily * 7);
            const adaptiveMonthly = Math.min(remaining, adaptiveDaily * 30);

            // Behind detection
            const expectedByNow = daysElapsed > 0 ? Math.round((goal.target_amount / totalDays) * daysElapsed) : 0;
            const onTrack = goal.current_amount >= expectedByNow * 0.95;

            return (
              <div className="px-4 md:px-0 mt-4 md:mt-0">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="card-playful p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">📊 Adaptive Savings Pace</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isPastDeadline ? "bg-destructive/15 text-destructive" : onTrack ? "bg-accent/15 text-accent" : "bg-chart-4/15 text-chart-4"
                    }`}>
                      {isPastDeadline ? "⚠️ Overdue" : onTrack ? "✅ On Track" : "⏰ Behind"}
                    </span>
                  </div>
                  {isPastDeadline ? (
                    <p className="text-xs text-muted-foreground">Deadline has passed. ₹{remaining.toLocaleString()} still needed.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-lg font-black text-foreground">{daysLeft}</p><p className="text-[10px] text-muted-foreground font-semibold">Days Left</p></div>
                        <div><p className="text-lg font-black text-primary">₹{adaptiveDaily.toLocaleString()}</p><p className="text-[10px] text-muted-foreground font-semibold">Per Day</p></div>
                        <div><p className="text-lg font-black text-primary">₹{adaptiveWeekly.toLocaleString()}</p><p className="text-[10px] text-muted-foreground font-semibold">Per Week</p></div>
                      </div>
                      {!onTrack && !isPastDeadline && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 bg-chart-4/10 rounded-lg p-2.5 text-center">
                          <p className="text-[11px] font-bold text-foreground">
                            Save ₹{adaptiveDaily.toLocaleString()}/day to catch up 💪
                          </p>
                          <p className="text-[10px] text-muted-foreground italic mt-0.5">Small catch-ups build big wins.</p>
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              </div>
            );
          })()}

          {/* Weekly Milestones (not for fun fund) */}
          {!goal.is_fun_fund && goal.deadline && !isComplete && (
            <div className="md:[&>div]:px-0">
              <GoalMilestones goal={goal} />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeposit && (
          <DepositModal onClose={() => setShowDeposit(false)} onDeposit={handleDeposit} loading={deposit.isPending} />
        )}
        {showWithdraw && (
          <WithdrawModal
            onClose={() => setShowWithdraw(false)}
            onWithdraw={handleWithdraw}
            loading={withdraw.isPending}
            maxAmount={goal.current_amount}
            isFunFund={goal.is_fun_fund}
            goalName={goal.name}
            goalIcon={goal.icon}
            goalProgress={pct}
            goalRemaining={goal.target_amount - goal.current_amount}
          />
        )}
        {showWhyStarted && (
          <WhyIStartedModal
            goal={goal}
            visible={showWhyStarted}
            onClose={() => setShowWhyStarted(false)}
            onAddMotivation={() => { setShowWhyStarted(false); setShowEdit(true); }}
          />
        )}
        {showEdit && (
          <EditGoalModal goal={goal} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
