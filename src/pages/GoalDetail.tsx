import { useParams, useNavigate } from "react-router-dom";
import { useGoals, useDeleteGoal } from "@/hooks/useGoals";
import { useFruits, useDeposit, useWithdraw, useManualMerge } from "@/hooks/useFruits";
import { useGoalImages, getGoalImageUrl } from "@/hooks/useGoalImages";
import { useEarnTokens } from "@/hooks/useProfile";
import { useState, useEffect, useRef } from "react";
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
import { toast } from "@/hooks/use-toast";

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
  const earnTokens = useEarnTokens();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [breakOverlay, setBreakOverlay] = useState<{ tier: number; amount: number } | null>(null);
  const [showWhyStarted, setShowWhyStarted] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [mysteryToast, setMysteryToast] = useState<{ visible: boolean; type: string }>({ visible: false, type: "" });

  // Track token milestones already awarded
  const awardedRef = useRef<Set<string>>(new Set());

  const goal = goals?.find((g) => g.id === id);

  const pct = goal && goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
  const isComplete = pct >= 100;
  const isFD = goal ? (goal as any).goal_mode === "fd" : false;
  const isRD = goal ? (goal as any).goal_mode === "rd" : false;
  const fruitTiers = getGoalFruitTiers(goal?.custom_fruit_values, goal?.custom_fruit_emojis);

  // Motivational notifications at milestones
  useEffect(() => {
    if (!goal || goal.is_fun_fund) return;
    const key50 = `${goal.id}-50`;
    const key70 = `${goal.id}-70`;
    const key80 = `${goal.id}-80`;
    const key100 = `${goal.id}-100`;

    if (pct >= 50 && !awardedRef.current.has(key50)) {
      awardedRef.current.add(key50);
      earnTokens.mutate({ goalId: goal.id, amount: 2, reason: "50% milestone" });
      toast({ title: "🪙 +2 Tokens!", description: "You reached 50%! Keep going!" });
    }
    if (pct >= 70 && !awardedRef.current.has(key70)) {
      awardedRef.current.add(key70);
      earnTokens.mutate({ goalId: goal.id, amount: 3, reason: "70% milestone" });
      toast({ title: "🪙 +3 Tokens!", description: "70% done! Almost there!" });
    }
    if (pct >= 80 && !awardedRef.current.has(key80)) {
      awardedRef.current.add(key80);
      toast({ title: "🔥 80% Complete!", description: "\"Success is the sum of small efforts, repeated.\"" });
    }
    if (pct >= 100 && !awardedRef.current.has(key100)) {
      awardedRef.current.add(key100);
      earnTokens.mutate({ goalId: goal.id, amount: 5, reason: "Goal completed" });
      toast({ title: "🎉 Goal Complete! 🪙 +5 Tokens!", description: "\"The only way to do great work is to love what you do.\"" });
    }
  }, [pct, goal?.id]);

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

  const handleDeposit = async (amount: number) => {
    const result = await deposit.mutateAsync({
      goalId: goal.id,
      amount,
      existingFruits: fruits ?? [],
      customFruitValues: goal.custom_fruit_values,
    });
    setShowDeposit(false);

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
    // Block FD withdrawal before maturity
    if (isFD && goal.deadline) {
      const maturity = new Date(goal.deadline);
      if (new Date() < maturity) {
        toast({ title: "🔒 Locked!", description: "FD cannot be broken before maturity. No reward if broken early.", variant: "destructive" });
        return;
      }
    }

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
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            {goal.is_fun_fund && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                🎉 No Pressure Fund
              </span>
            )}
            {isFD && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-chart-4/20 text-primary-foreground">🔒 Fixed Deposit</span>}
            {isRD && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-chart-4/20 text-primary-foreground">📆 Recurring Deposit</span>}
            {(goal as any).goal_type === "short" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-primary-foreground">⚡ Short Term</span>}
            {(goal as any).goal_type === "long" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/20 text-primary-foreground">📅 Long Term</span>}
          </div>
          {!goal.is_fun_fund && (
            <p className="text-primary-foreground/70 text-sm font-semibold">
              Goal: ₹{goal.target_amount.toLocaleString()}
            </p>
          )}
          {goal.deadline && (
            <p className="text-primary-foreground/60 text-xs font-semibold mt-1">
              🗓️ {isFD ? "Maturity" : "Deadline"}: {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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

          {/* FD Maturity Info */}
          {isFD && goal.deadline && (
            <div className="px-4 md:px-0 mt-3">
              <div className="card-playful p-3 text-center bg-chart-4/5 border border-chart-4/20">
                {new Date() < new Date(goal.deadline) ? (
                  <>
                    <p className="text-xs font-bold text-foreground">🔒 Locked until maturity</p>
                    <p className="text-[10px] text-muted-foreground">Withdrawals blocked. Complete to earn mystical fruit! 🌟</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold text-accent">✅ FD Matured!</p>
                    <p className="text-[10px] text-muted-foreground">You can now withdraw your savings.</p>
                  </>
                )}
              </div>
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
              disabled={goal.current_amount === 0 || (isFD && goal.deadline && new Date() < new Date(goal.deadline))}
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

            const adaptiveDaily = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : remaining;
            const adaptiveWeekly = Math.min(remaining, adaptiveDaily * 7);

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
