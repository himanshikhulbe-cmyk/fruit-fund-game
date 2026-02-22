import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyCircles, useCircleMembers, useCircleDeposits, useCreateCircle, useJoinCircle, Circle } from "@/hooks/useCircles";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

function CircleDetail({ circle, onBack }: { circle: Circle; onBack: () => void }) {
  const { data: members } = useCircleMembers(circle.id);
  const { data: deposits } = useCircleDeposits(circle.id);

  // Leaderboard calculations
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weekDeposits = deposits?.filter((d) => new Date(d.deposited_at) >= weekAgo) ?? [];
  const totalCircleSavings = deposits?.reduce((s, d) => s + d.amount, 0) ?? 0;

  // Top saver this week
  const weekByUser: Record<string, number> = {};
  weekDeposits.forEach((d) => { weekByUser[d.user_id] = (weekByUser[d.user_id] || 0) + d.amount; });
  const topSaverUserId = Object.entries(weekByUser).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Most consistent (most deposit count)
  const depositCountByUser: Record<string, number> = {};
  deposits?.forEach((d) => { depositCountByUser[d.user_id] = (depositCountByUser[d.user_id] || 0) + 1; });
  const consistentUserId = Object.entries(depositCountByUser).sort((a, b) => b[1] - a[1])[0]?.[0];

  const getMemberName = (userId: string) => members?.find((m) => m.user_id === userId)?.display_name ?? "Unknown";

  return (
    <div>
      <button onClick={onBack} className="text-primary font-bold text-sm mb-4">← Back to Circles</button>
      <div className="card-playful p-4 mb-4">
        <h2 className="text-lg font-black text-foreground">{circle.name}</h2>
        <p className="text-xs text-muted-foreground font-semibold">
          Invite Code: <span className="text-primary font-black">{circle.invite_code}</span>
        </p>
        <p className="text-xs text-muted-foreground">{members?.length ?? 0} members</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="card-playful p-3 text-center">
          <p className="text-lg font-black text-foreground">₹{totalCircleSavings.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground font-semibold">Total Savings</p>
        </div>
        <div className="card-playful p-3 text-center">
          <p className="text-sm font-black text-accent">{topSaverUserId ? `🏆 ${getMemberName(topSaverUserId)}` : "—"}</p>
          <p className="text-[10px] text-muted-foreground font-semibold">Top Saver (Week)</p>
        </div>
        <div className="card-playful p-3 text-center">
          <p className="text-sm font-black text-primary">{consistentUserId ? `🔥 ${getMemberName(consistentUserId)}` : "—"}</p>
          <p className="text-[10px] text-muted-foreground font-semibold">Most Consistent</p>
        </div>
      </div>

      {/* Members */}
      <div className="card-playful p-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Members</h3>
        <div className="space-y-2">
          {members?.map((m) => {
            const userTotal = deposits?.filter((d) => d.user_id === m.user_id).reduce((s, d) => s + d.amount, 0) ?? 0;
            return (
              <div key={m.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/40">
                <span className="text-sm font-bold text-foreground">{m.display_name}</span>
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
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) return;
    try {
      await joinCircle.mutateAsync({ inviteCode: joinCode.trim(), displayName: joinName.trim() });
      setShowJoin(false);
      setJoinCode("");
      setJoinName("");
    } catch (err: any) {
      alert(err.message);
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

      <div className="px-4 mt-4">
        {selectedCircle ? (
          <CircleDetail circle={selectedCircle} onBack={() => setSelectedCircle(null)} />
        ) : (
          <>
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreate(true)}
                className="btn-deposit py-3 rounded-xl text-primary-foreground font-bold text-sm"
              >
                Create Circle
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJoin(true)}
                className="py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm"
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
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
            onClick={() => setShowCreate(false)}
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
            className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
            onClick={() => setShowJoin(false)}
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
