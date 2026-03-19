import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HowItWorksSection from "@/components/HowItWorksSection";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { useRedeemedCodes, useRedeemCode, useUserTokens, useMarketInventory, useWishlists, useAddWishlistItem, useDeleteWishlistItem, useDraftGoals, useDeleteDraft, useIsPremium } from "@/hooks/useProfile";
import { MARKET_ITEM_IMAGE_MAP } from "@/utils/fruitLogic";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

import goldenCherryImg from "@/assets/fruits/golden-cherry.png";
import goldenStrawberryImg from "@/assets/fruits/golden-strawberry.png";
import starfruitImg from "@/assets/fruits/starfruit.png";
import peachImg from "@/assets/fruits/peach.png";
import custardAppleImg from "@/assets/fruits/custard-apple.png";
import grapeImg from "@/assets/fruits/grape.png";
import goldenGuavaImg from "@/assets/fruits/golden-guava.png";

const COLLECTION_IMAGE_MAP: Record<string, string> = {
  "golden-cherry": goldenCherryImg,
  "golden-strawberry": goldenStrawberryImg,
  "peach": peachImg,
  "golden-guava": goldenGuavaImg,
  "starfruit": starfruitImg,
  "custard-apple": custardAppleImg,
  "grape": grapeImg,
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { data: goals } = useGoals();
  const { data: codes } = useRedeemedCodes();
  const redeemCode = useRedeemCode();
  const { data: tokenData } = useUserTokens();
  const { data: inventory } = useMarketInventory();
  const { data: wishlists } = useWishlists();
  const addWishlist = useAddWishlistItem();
  const deleteWishlist = useDeleteWishlistItem();
  const { data: drafts } = useDraftGoals();
  const deleteDraft = useDeleteDraft();
  const isPremium = useIsPremium();
  const navigate = useNavigate();

  const [redeemInput, setRedeemInput] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [wishTitle, setWishTitle] = useState("");
  const [wishDesc, setWishDesc] = useState("");
  const [wishLink, setWishLink] = useState("");

  // Stats calculations
  const allGoals = goals ?? [];
  const completedGoals = allGoals.filter((g) => !g.is_fun_fund && g.current_amount >= g.target_amount);
  const activeGoals = allGoals.filter((g) => !g.is_fun_fund && g.current_amount < g.target_amount);
  const abandonedGoals = 0; // Would need tracking
  const missedDeadlines = allGoals.filter((g) => g.deadline && new Date(g.deadline) < new Date() && g.current_amount < g.target_amount).length;

  const handleRedeem = async () => {
    if (!redeemInput.trim()) return;
    try {
      const result = await redeemCode.mutateAsync(redeemInput);
      toast({ title: "🎉 Code Redeemed!", description: result.label });
      setRedeemInput("");
    } catch (err: any) {
      toast({ title: "❌ Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAddWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishTitle.trim()) return;
    await addWishlist.mutateAsync({ title: wishTitle.trim(), description: wishDesc.trim() || undefined, link_url: wishLink.trim() || undefined });
    setWishTitle("");
    setWishDesc("");
    setWishLink("");
    toast({ title: "✅ Added to wishlist!" });
  };

  // Achievement badges for completed goals
  const getBadges = (goal: typeof allGoals[0]) => {
    const badges: string[] = [];
    if (goal.deadline && new Date(goal.deadline) > new Date(goal.created_at)) {
      const deadlineDate = new Date(goal.deadline);
      // Check if finished early (current date < deadline when completed)
      badges.push("🏆 Deadline Crusher");
    }
    badges.push("⭐ Goal Achiever");
    return badges;
  };

  const sections = [
    { id: "stats", label: "📊 Statistics", icon: "📊" },
    { id: "vault", label: "🏆 Achievement Vault", icon: "🏆" },
    { id: "redeem", label: "🎟️ Redeem Code", icon: "🎟️" },
    { id: "premium", label: "👑 Premium", icon: "👑" },
    { id: "wishlist", label: "💝 Wishlist", icon: "💝" },
    { id: "drafts", label: "📝 Draft Goals", icon: "📝" },
    { id: "inventory", label: "🎒 My Collection", icon: "🎒" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sky-gradient px-4 pt-6 pb-6 rounded-b-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👤</span>
            <h1 className="text-2xl font-black text-primary-foreground">Profile</h1>
          </div>
          <button onClick={signOut} className="text-primary-foreground/70 text-xs font-bold">Logout</button>
        </div>
        <p className="text-primary-foreground/70 text-xs font-semibold">{user?.email}</p>
        {isPremium && (
          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground">
            👑 Premium Active
          </span>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary-foreground/80 text-xs font-bold">🪙 {tokenData?.total ?? 0} Tokens</span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-2">
        {sections.map((s) => (
          <div key={s.id}>
            <button
              onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
              className="w-full card-playful p-3 flex items-center justify-between text-left"
            >
              <span className="text-sm font-bold text-foreground">{s.label}</span>
              <span className="text-muted-foreground text-xs">{activeSection === s.id ? "▼" : "▶"}</span>
            </button>

            <AnimatePresence>
              {activeSection === s.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="card-playful p-4 mt-1">
                    {/* STATISTICS */}
                    {s.id === "stats" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xl font-black text-foreground">{allGoals.length}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">Total Goals</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xl font-black text-accent">{completedGoals.length}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">Completed</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xl font-black text-primary">{activeGoals.length}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">Active</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <p className="text-xl font-black text-destructive">{missedDeadlines}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">Deadlines Missed</p>
                        </div>
                      </div>
                    )}

                    {/* ACHIEVEMENT VAULT */}
                    {s.id === "vault" && (
                      <div className="space-y-3">
                        {completedGoals.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">Complete a goal to earn achievements! 🏆</p>
                        ) : (
                          completedGoals.map((g) => {
                            const timeTaken = Math.ceil((Date.now() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24));
                            return (
                              <div key={g.id} className="bg-accent/5 border border-accent/20 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xl">{g.icon}</span>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground">{g.name}</p>
                                    <p className="text-[10px] text-muted-foreground">₹{g.target_amount.toLocaleString()} • {timeTaken} days</p>
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {getBadges(g).map((b, i) => (
                                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">{b}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* REDEEM CODE */}
                    {s.id === "redeem" && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={redeemInput}
                            onChange={(e) => setRedeemInput(e.target.value)}
                            placeholder="Enter code (e.g. FINCODE2026)"
                            className="flex-1 px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button onClick={handleRedeem} disabled={redeemCode.isPending} className="px-4 py-2.5 rounded-lg btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50">
                            {redeemCode.isPending ? "..." : "Redeem"}
                          </button>
                        </div>
                        {codes && codes.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground">Redeemed:</p>
                            {codes.map((c) => (
                              <div key={c.id} className="text-xs text-muted-foreground flex justify-between">
                                <span className="font-bold">{c.code}</span>
                                <span>{new Date(c.redeemed_at).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* PREMIUM */}
                    {s.id === "premium" && (
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-xl p-3">
                          <p className="text-sm font-bold text-foreground mb-1">Basic Plan (Free)</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            <li>• Max 2 goals</li>
                            <li>• 1 circle</li>
                            <li>• Premium free for 30 days</li>
                          </ul>
                        </div>
                        <div className="bg-accent/10 border border-accent/20 rounded-xl p-3">
                          <p className="text-sm font-bold text-accent mb-1">👑 Premium Plan</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            <li>• Unlimited goals</li>
                            <li>• Multiple circles</li>
                            <li>• Access FriendFund</li>
                          </ul>
                          {isPremium ? (
                            <p className="text-xs font-bold text-accent mt-2">✅ Active</p>
                          ) : (
                            <p className="text-[10px] text-muted-foreground mt-2">Use code CAMPUSVIP for 30 days free!</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* WISHLIST */}
                    {s.id === "wishlist" && (
                      <div className="space-y-3">
                        <form onSubmit={handleAddWishlist} className="space-y-2">
                          <input
                            type="text"
                            value={wishTitle}
                            onChange={(e) => setWishTitle(e.target.value)}
                            placeholder="Item name"
                            required
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={wishDesc}
                            onChange={(e) => setWishDesc(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="url"
                            value={wishLink}
                            onChange={(e) => setWishLink(e.target.value)}
                            placeholder="Link (optional)"
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button type="submit" disabled={addWishlist.isPending} className="w-full py-2.5 rounded-lg btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50">
                            Add to Wishlist 💝
                          </button>
                        </form>
                        {wishlists && wishlists.length > 0 && (
                          <div className="space-y-2">
                            {wishlists.map((w) => (
                              <div key={w.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate">{w.title}</p>
                                  {w.description && <p className="text-[10px] text-muted-foreground truncate">{w.description}</p>}
                                  {w.link_url && (
                                    <a href={w.link_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold">🔗 Link</a>
                                  )}
                                </div>
                                <button onClick={() => deleteWishlist.mutate(w.id)} className="text-destructive text-xs font-bold">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* DRAFTS */}
                    {s.id === "drafts" && (
                      <div className="space-y-2">
                        {!drafts || drafts.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No drafts yet. Start creating a goal to auto-save! 📝</p>
                        ) : (
                          drafts.map((d: any) => (
                            <div key={d.id} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2.5">
                              <span className="text-xl">{d.icon || "🎯"}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{d.name || "Untitled"}</p>
                                <p className="text-[10px] text-muted-foreground">₹{(d.target_amount || 0).toLocaleString()}</p>
                              </div>
                              <button onClick={() => navigate("/")} className="text-primary text-xs font-bold">Resume</button>
                              <button onClick={() => deleteDraft.mutate(d.id)} className="text-destructive text-xs font-bold">✕</button>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* COLLECTION/INVENTORY */}
                    {s.id === "inventory" && (
                      <div>
                        {!inventory || inventory.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">No items yet. Visit the Fruit Market! 🏪</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            {inventory.map((item) => {
                              const imageKey = MARKET_ITEM_IMAGE_MAP[item.item_name];
                              const imageSrc = imageKey ? COLLECTION_IMAGE_MAP[imageKey] : null;
                              return (
                                <div key={item.id} className="aspect-square flex flex-col items-center justify-center rounded-xl bg-muted/50 border border-border p-2">
                                  {imageSrc ? (
                                    <img src={imageSrc} alt={item.item_name} className="w-12 h-12 object-contain" />
                                  ) : (
                                    <span className="text-2xl">{item.item_emoji}</span>
                                  )}
                                  <span className="text-[8px] text-muted-foreground font-bold mt-1 truncate w-full text-center px-1">{item.item_name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <BottomNav onAddGoal={() => navigate("/")} canCreate={false} />
    </div>
  );
}
