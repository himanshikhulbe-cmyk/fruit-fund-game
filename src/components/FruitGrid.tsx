import { getFruitInfo, FruitData } from "@/utils/fruitLogic";
import { motion, AnimatePresence } from "framer-motion";

interface FruitGridProps {
  fruits: FruitData[];
  loading?: boolean;
}

export default function FruitGrid({ fruits, loading }: FruitGridProps) {
  if (loading) {
    return (
      <div className="fruit-grid-bg rounded-xl p-4 min-h-[160px] flex items-center justify-center">
        <div className="animate-spin text-3xl">🍊</div>
      </div>
    );
  }

  if (fruits.length === 0) {
    return (
      <div className="fruit-grid-bg rounded-xl p-6 min-h-[160px] flex flex-col items-center justify-center">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-muted-foreground text-sm font-semibold">
          Deposit to grow your first fruit!
        </p>
      </div>
    );
  }

  // Sort by tier descending for display
  const sorted = [...fruits].sort((a, b) => b.tier - a.tier);

  return (
    <div className="fruit-grid-bg rounded-xl p-3 min-h-[160px]">
      <div className="grid grid-cols-4 gap-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((fruit, i) => {
            const info = getFruitInfo(fruit.tier);
            return (
              <motion.div
                key={fruit.id ?? `${fruit.tier}-${i}`}
                layout
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.03 }}
                className="aspect-square flex items-center justify-center rounded-xl bg-card shadow-playful cursor-default hover:shadow-float transition-shadow"
                title={`${info.name} — ₹${info.value}`}
              >
                <span className="text-3xl select-none">{info.emoji}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
