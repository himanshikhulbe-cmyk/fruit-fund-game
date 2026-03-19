import { useState } from "react";
import { useGoals, useCreateGoal } from "@/hooks/useGoals";
import { useAllCircleGoals } from "@/hooks/useAllCircleGoals";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import CreateGoalModal from "@/components/CreateGoalModal";
import SavingsNudgeBanner from "@/components/SavingsNudgeBanner";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";
import { getEvolutionStage } from "@/utils/fruitLogic";

export default function Dashboard() {
  const { data: goals, isLoading } = useGoals();
  const { data: circleGoals } = useAllCircleGoals();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const totalSavings = goals?.reduce((s, g) => s + g.current_amount, 0) ?? 0;
  const canCreate = true;

  // Separate fun fund from regular goals
  const funFund = goals?.find((g) => g.is_fun_fund);
  const regularGoals = goals?.filter((g) => !g.is_fun_fund) ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <OnboardingWalkthrough />

      {/* Header */}
      <div className="sky-gradient px-4 pt-6 pb-8 rounded-b-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🍍</span>
            <h1 className="text-2xl font-black text-primary-foreground">FruitFund</h1>
          </div>
          <button onClick={() => navigate("/profile")} className="text-primary-foreground/70 text-xs font-bold hover:text-primary-foreground transition-colors">👤 Profile</button>
        </div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-primary/90 rounded-xl px-5 py-3 shadow-float">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-primary-foreground/70 text-xs font-semibold">Total Savings</p>
              <p className="text-primary-foreground text-2xl font-black">₹{totalSavings.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Savings Nudge Banner */}
      {goals && goals.length > 0 && <SavingsNudgeBanner goals={goals} />}

      {/* Goals */}
      <div className="px-4 mt-6">
        {/* Fun Fund Card */}
        {funFund && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(`/goal/${funFund.id}`)}
            className="card-playful p-4 cursor-pointer hover:shadow-float transition-all active:scale-[0.98] mb-4 border-2 border-accent/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{funFund.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{funFund.name}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">🎉 No Pressure</span>
                </div>
                <p className="text-xs text-muted-foreground">₹{funFund.current_amount.toLocaleString()} saved</p>
              </div>
              <span className="text-sm font-black text-accent">→</span>
            </div>
          </motion.div>
        )}

        {/* My Goals Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">My Goals</h2>
          <span className="text-xs font-semibold text-muted-foreground">{regularGoals.length} goals</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin text-3xl">🍊</div>
          </div>
        ) : regularGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {regularGoals.map((goal, i) => {
                const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
                const goalType = (goal as any).goal_type;
                const goalMode = (goal as any).goal_mode;
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-foreground">{goal.name}</h3>
                          {goal.priority === 1 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive">High</span>}
                          {goal.priority === 2 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-chart-4/15 text-chart-4">Med</span>}
                          {goal.priority === 3 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent">Low</span>}
                          {goalType === "short" && <span className="text-[10px] font-bold px-1 py-0.5 rounded-full bg-secondary/15 text-secondary">⚡ Short</span>}
                          {goalType === "long" && <span className="text-[10px] font-bold px-1 py-0.5 rounded-full bg-secondary/15 text-secondary">📅 Long</span>}
                          {goalMode === "fd" && <span className="text-[10px] font-bold px-1 py-0.5 rounded-full bg-chart-4/15 text-chart-4">🔒 FD</span>}
                          {goalMode === "rd" && <span className="text-[10px] font-bold px-1 py-0.5 rounded-full bg-chart-4/15 text-chart-4">📆 RD</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}
                        </p>
                        {goal.deadline && (
                          <p className="text-xs text-muted-foreground">
                            🗓️ {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-black text-primary">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-primary rounded-full" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : !funFund ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-muted-foreground font-semibold">No goals yet</p>
            <p className="text-muted-foreground text-sm mb-4">Create your first savings goal!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-deposit px-6 py-3 rounded-xl text-primary-foreground font-bold text-sm"
            >
              Create Your First Goal 🎯
            </button>
          </motion.div>
        ) : null}

        {/* Circle Goals Section */}
        {circleGoals && circleGoals.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Circle Goals</h2>
              <span className="text-xs font-semibold text-muted-foreground">{circleGoals.length} goals</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {circleGoals.map((cg, i) => {
                const pct = cg.target_amount > 0 ? Math.min(100, (cg.current_amount / cg.target_amount) * 100) : 0;
                const evolution = getEvolutionStage(cg.current_amount, cg.target_amount);
                return (
                  <motion.div
                    key={cg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate("/circles")}
                    className="card-playful p-4 cursor-pointer hover:shadow-float transition-all active:scale-[0.98] border border-secondary/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{cg.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-foreground">{cg.name}</h3>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">👥 Circle</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ₹{cg.current_amount.toLocaleString()} / ₹{cg.target_amount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{cg.circle_name}</span>
                          <span>•</span>
                          <span>{cg.member_count} members</span>
                          <span>•</span>
                          <span>{evolution.label}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-secondary">{Math.round(pct)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-secondary rounded-full" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* FriendFund Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/circles")}
          className="card-playful p-4 cursor-pointer hover:shadow-float transition-all active:scale-[0.98] mt-6 border-2 border-secondary/20"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👫</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">FriendFund</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">Circles</span>
              </div>
              <p className="text-xs text-muted-foreground">Save together with friends & family</p>
            </div>
            <span className="text-sm font-black text-secondary">→</span>
          </div>
        </motion.div>

        {/* Stats */}
        {goals && goals.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
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
        {showCreate && <CreateGoalModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
