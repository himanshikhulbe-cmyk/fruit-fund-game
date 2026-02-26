import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyCircles, useCircleMembers, useCircleDeposits, useCreateCircle, useJoinCircle, useLogCircleDeposit, Circle } from "@/hooks/useCircles";
import { useCircleGoals, useCreateCircleGoal, useContributeToCircleGoal, useCircleGoalContributions, CircleGoal } from "@/hooks/useCircleGoals";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

function CircleGoalDetail({ goal, members }: { goal: CircleGoal; members: any[] }) {
  const { data: contributions } = useCircleGoalContributions(goal.id);
  const contribute = useContributeToCircleGoal();
  const [amount, setAmount] = useState("");

  const pct = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;

  // Contribution breakdown per member
  const byMember: Record<string, number> = {};
  contributions?.forEach((c) => { byMember[c.user_id] = (byMember[c.user_id] || 0) + c.amount; });

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return;
    await contribute.mutateAsync({ circleGoalId: goal.id, amount: amt });
    setAmount("");
    toast({ title: "✅ Contributed!" });
  };

  return (
    <div className="card-playful p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{goal.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{goal.name}</p>
          <p className="text-[10px] text-muted-foreground">₹{goal.current_amount.toLocaleString()} / ₹{goal.target_amount.toLocaleString()}</p>
        </div>
        <span className="text-xs font-black text-primary">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-primary rounded-full" />
      </div>
      {/* Member breakdown */}
      <div className="space-y-1">
        {members?.map((m) => {
          const memberAmt = byMember[m.user_id] ?? 0;
          const memberPct = goal.current_amount > 0 ? Math.round((memberAmt / goal.current_amount) * 100) : 0;
          return (
            <div key={m.id} className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-foreground">{m.display_name}</span>
              <span className="text-muted-foreground">₹{memberAmt.toLocaleString()} ({memberPct}%)</span>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleContribute} className="flex gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹ Amount"
          min={1}
          className="flex-1 px-2 py-1.5 rounded-lg bg-muted border border-border text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="submit" disabled={contribute.isPending} className="px-3 py-1.5 rounded-lg btn-deposit text-primary-foreground font-bold text-[10px] disabled:opacity-50">
          Contribute
        </button>
      </form>
    </div>
  );
}

function CircleLeaderboard({ deposits, members }: { deposits: any[]; members: any[] }) {
  const [sortBy, setSortBy] = useState<"amount" | "streak">("amount");

  // Calculate per-member stats
  const memberStats = members?.map((m) => {
    const memberDeposits = deposits?.filter((d) => d.user_id === m.user_id) ?? [];
    const totalAmount = memberDeposits.reduce((s, d) => s + d.amount, 0);

    // Calculate streaks
    const dates = [...new Set(memberDeposits.map((d) => new Date(d.deposited_at).toDateString()))].sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    currentStreak = tempStreak;

    const totalDeposits = deposits?.reduce((s, d) => s + d.amount, 0) ?? 1;
    const pct = totalDeposits > 0 ? Math.round((totalAmount / totalDeposits) * 100) : 0;

    return { ...m, totalAmount, currentStreak, longestStreak, pct };
  }) ?? [];

  const sorted = [...memberStats].sort((a, b) =>
    sortBy === "amount" ? b.totalAmount - a.totalAmount : b.currentStreak - a.currentStreak
  );

  const rankEmojis = ["🥇", "🥈", "🥉"];

  return (
    <div className="card-playful p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">🏆 Leaderboard</h3>
        <div className="flex gap-1">
          <button onClick={() => setSortBy("amount")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${sortBy === "amount" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            💰 Amount
          </button>
          <button onClick={() => setSortBy("streak")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${sortBy === "streak" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            🔥 Streak
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map((m, i) => (
          <div key={m.id} className={`flex items-center gap-2 py-2 px-2.5 rounded-lg ${i === 0 ? "bg-accent/10" : "bg-muted/40"}`}>
            <span className="text-lg w-6 text-center">{rankEmojis[i] ?? `#${i + 1}`}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{m.display_name}</p>
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                <span>₹{m.totalAmount.toLocaleString()}</span>
                <span>🔥 {m.currentStreak}d streak</span>
                <span>Best: {m.longestStreak}d</span>
                <span>{m.pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleDetail({ circle, onBack }: { circle: Circle; onBack: () => void }) {
  const { data: members } = useCircleMembers(circle.id);
  const { data: deposits } = useCircleDeposits(circle.id);
  const { data: circleGoals } = useCircleGoals(circle.id);
  const createGoal = useCreateCircleGoal();
  const logDeposit = useLogCircleDeposit();
  const { user } = useAuth();

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("1000");
  const [depositAmount, setDepositAmount] = useState("");

  const totalCircleSavings = deposits?.reduce((s, d) => s + d.amount, 0) ?? 0;

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    await createGoal.mutateAsync({ circleId: circle.id, name: goalName.trim(), targetAmount: parseInt(goalTarget) || 1000, icon: "🎯" });
    setGoalName("");
    setGoalTarget("1000");
    setShowCreateGoal(false);
    toast({ title: "🎯 Shared goal created!" });
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(depositAmount);
    if (!amt || amt <= 0) return;
    await logDeposit.mutateAsync({ circleId: circle.id, amount: amt });
    setDepositAmount("");
    toast({ title: "💰 Deposit logged!" });
  };

  return (
    <div>
      <button onClick={onBack} className="text-primary font-bold text-sm mb-4">← Back to Circles</button>
      <div className="card-playful p-4 mb-4">
        <h2 className="text-lg font-black text-foreground">{circle.name}</h2>
        <p className="text-xs text-muted-foreground font-semibold">
          Invite Code: <span className="text-primary font-black">{circle.invite_code}</span>
        </p>
        <p className="text-xs text-muted-foreground">{members?.length ?? 0} members • ₹{totalCircleSavings.toLocaleString()} total</p>
      </div>

      {/* Log personal deposit */}
      <form onSubmit={handleDeposit} className="card-playful p-3 mb-3 flex gap-2">
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Log deposit ₹"
          min={1}
          className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button type="submit" disabled={logDeposit.isPending} className="px-4 py-2 rounded-lg btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50">
          Log 💰
        </button>
      </form>

      {/* Leaderboard */}
      {members && deposits && <CircleLeaderboard deposits={deposits} members={members} />}

      {/* FriendFund - Shared Goals */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">🤝 FriendFund Goals</h3>
          <button onClick={() => setShowCreateGoal(!showCreateGoal)} className="text-xs font-bold text-primary">+ New</button>
        </div>

        <AnimatePresence>
          {showCreateGoal && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreateGoal}
              className="card-playful p-3 mb-3 space-y-2 overflow-hidden"
            >
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="Goal name"
                required
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Target ₹"
                min={100}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="submit" disabled={createGoal.isPending} className="w-full py-2 rounded-lg btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50">
                Create Shared Goal 🎯
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {circleGoals && circleGoals.length > 0 ? (
          <div className="space-y-3">
            {circleGoals.map((g) => (
              <CircleGoalDetail key={g.id} goal={g} members={members ?? []} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">No shared goals yet. Create one!</p>
        )}
      </div>

      {/* Members */}
      <div className="card-playful p-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Members</h3>
        <div className="space-y-2">
          {members?.map((m) => {
            const userTotal = deposits?.filter((d) => d.user_id === m.user_id).reduce((s, d) => s + d.amount, 0) ?? 0;
            return (
              <div key={m.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                    {m.display_name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-foreground">{m.display_name}</span>
                </div>
                <span className="text-xs font-semibold text-primary">₹{userTotal.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CirclesPage() {
  const { data: circles, isLoading } = useMyCircles();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [createName, setCreateName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const createCircle = useCreateCircle();
  const joinCircle = useJoinCircle();
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !displayName.trim()) return;
    await createCircle.mutateAsync({ name: createName.trim(), displayName: displayName.trim() });
    setShowCreate(false);
    setCreateName("");
    setDisplayName("");
    toast({ title: "🎉 Circle created!" });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) return;
    try {
      await joinCircle.mutateAsync({ inviteCode: joinCode.trim(), displayName: joinName.trim() });
      setShowJoin(false);
      setJoinCode("");
      setJoinName("");
      toast({ title: "🎉 Joined circle!" });
    } catch (err: any) {
      toast({ title: "❌ Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sky-gradient px-4 pt-6 pb-6 rounded-b-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">👥</span>
          <h1 className="text-2xl font-black text-primary-foreground">Circles</h1>
        </div>
        <p className="text-primary-foreground/70 text-xs font-semibold">Save together, grow together</p>
      </div>

      <div className="px-4 mt-4 pb-20">
        {selectedCircle ? (
          <CircleDetail circle={selectedCircle} onBack={() => setSelectedCircle(null)} />
        ) : (
          <>
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreate(true)}
                className="btn-deposit py-3.5 rounded-xl text-primary-foreground font-bold text-sm min-h-[48px]"
              >
                Create Circle
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJoin(true)}
                className="py-3.5 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm min-h-[48px]"
              >
                Join Circle
              </motion.button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin text-3xl">🍊</div>
              </div>
            ) : circles && circles.length > 0 ? (
              <div className="space-y-3">
                {circles.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedCircle(c)}
                    className="card-playful p-4 cursor-pointer hover:shadow-float transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👥</span>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{c.name}</h3>
                        <p className="text-xs text-muted-foreground">Code: {c.invite_code}</p>
                      </div>
                      <span className="text-muted-foreground text-sm">→</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">👥</div>
                <p className="text-muted-foreground font-semibold">No circles yet</p>
                <p className="text-muted-foreground text-sm">Create or join a savings circle!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl p-6"
            >
              <h2 className="text-lg font-black text-foreground mb-4">Create Circle 👥</h2>
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Circle name"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={createCircle.isPending} className="w-full py-3 rounded-xl btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50">
                  {createCircle.isPending ? "Creating..." : "Create 🎉"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card rounded-2xl p-6"
            >
              <h2 className="text-lg font-black text-foreground mb-4">Join Circle 🤝</h2>
              <form onSubmit={handleJoin} className="space-y-3">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="Invite code"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Your display name"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" disabled={joinCircle.isPending} className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm disabled:opacity-50">
                  {joinCircle.isPending ? "Joining..." : "Join 🎉"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav onAddGoal={() => navigate("/")} canCreate={false} />
    </div>
  );
}
