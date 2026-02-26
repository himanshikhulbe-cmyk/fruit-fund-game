import { useState } from "react";
import { motion } from "framer-motion";
import { useUserTokens, useMarketInventory, usePurchaseMarketItem } from "@/hooks/useProfile";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

import goldenCherryImg from "@/assets/fruits/golden-cherry.png";
import goldenStrawberryImg from "@/assets/fruits/golden-strawberry.png";
import starfruitImg from "@/assets/fruits/starfruit.png";
import peachImg from "@/assets/fruits/peach.png";
import custardAppleImg from "@/assets/fruits/custard-apple.png";
import grapeImg from "@/assets/fruits/grape.png";

interface MarketItem {
  id: string;
  type: string;
  name: string;
  emoji: string;
  image?: string;
  cost: number;
  category: string;
}

const MARKET_ITEMS: MarketItem[] = [
  { id: "golden_cherry", type: "golden", name: "Golden Cherry", emoji: "🍒✨", image: goldenCherryImg, cost: 5, category: "Golden" },
  { id: "golden_strawberry", type: "golden", name: "Golden Strawberry", emoji: "🍓✨", image: goldenStrawberryImg, cost: 8, category: "Golden" },
  { id: "fusion_apple_peach", type: "fusion", name: "Apple Peach Fusion", emoji: "🍎🍑", image: peachImg, cost: 12, category: "Fusion" },
  { id: "fusion_rasp_guava", type: "fusion", name: "Raspberry Guava", emoji: "🫐🍈", image: grapeImg, cost: 12, category: "Fusion" },
  { id: "exotic_starfruit", type: "exotic", name: "Starfruit", emoji: "⭐🍈", image: starfruitImg, cost: 20, category: "Exotic" },
  { id: "exotic_custard", type: "exotic", name: "Custard Apple", emoji: "🍏🧁", image: custardAppleImg, cost: 18, category: "Exotic" },
  { id: "exotic_mystical_grapes", type: "exotic", name: "Mystical Grapes", emoji: "🍇✨", image: grapeImg, cost: 22, category: "Exotic" },
];

export default function MarketPage() {
  const { data: tokenData } = useUserTokens();
  const { data: inventory } = useMarketInventory();
  const purchase = usePurchaseMarketItem();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");

  const balance = tokenData?.total ?? 0;
  const categories = ["All", "Golden", "Fusion", "Exotic"];
  const filtered = filter === "All" ? MARKET_ITEMS : MARKET_ITEMS.filter((i) => i.category === filter);

  const handlePurchase = async (item: MarketItem) => {
    if (balance < item.cost) {
      toast({ title: "Not enough tokens!", description: `Need ${item.cost} tokens, you have ${balance}.`, variant: "destructive" });
      return;
    }
    await purchase.mutateAsync({ itemType: item.type, itemName: item.name, itemEmoji: item.emoji, tokenCost: item.cost });
    toast({ title: "🎉 Purchased!", description: `${item.name} added to your collection!` });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sky-gradient px-4 pt-6 pb-6 rounded-b-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🏪</span>
          <h1 className="text-2xl font-black text-primary-foreground">Fruit Market</h1>
        </div>
        <p className="text-primary-foreground/70 text-xs font-semibold">Spend tokens on collectible fruits</p>
        <div className="mt-2 bg-primary/90 rounded-lg px-3 py-2 inline-block">
          <span className="text-primary-foreground font-black text-sm">🪙 {balance} Tokens</span>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Token earning info */}
        <div className="card-playful p-3 mb-4">
          <p className="text-xs font-bold text-foreground mb-1">How to earn tokens:</p>
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <p>• 🪙 2 tokens at 50% goal progress</p>
            <p>• 🪙 3 tokens at 70% goal progress</p>
            <p>• 🪙 5 tokens at 100% goal completion</p>
            <p>• 🪙 Redeem campus codes for rewards</p>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item, i) => {
            const owned = inventory?.filter((inv) => inv.item_name === item.name).length ?? 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-playful p-3 flex flex-col items-center text-center"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain mb-1 rounded-lg"
                  />
                ) : (
                  <span className="text-3xl mb-1">{item.emoji}</span>
                )}
                <p className="text-xs font-bold text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mb-2">🪙 {item.cost} tokens</p>
                {owned > 0 && <p className="text-[10px] text-accent font-bold mb-1">Owned: {owned}</p>}
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={balance < item.cost || purchase.isPending}
                  className="w-full py-1.5 rounded-lg btn-deposit text-primary-foreground font-bold text-[10px] disabled:opacity-40"
                >
                  Buy
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BottomNav onAddGoal={() => navigate("/")} canCreate={false} />
    </div>
  );
}
