import { useState, useCallback } from "react";
import { getFruitInfo, FruitData } from "@/utils/fruitLogic";
import { motion, AnimatePresence } from "framer-motion";

interface FruitGridProps {
  fruits: FruitData[];
  loading?: boolean;
  onMerge?: (fruitAId: string, fruitBId: string) => void;
  merging?: boolean;
  withdrawing?: boolean;
}

export default function FruitGrid({ fruits, loading, onMerge, merging, withdrawing }: FruitGridProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleTap = useCallback(
    (fruit: FruitData) => {
      if (merging) return;

      if (!selectedId) {
        // Select first fruit (only if there's another of same tier to merge with)
        const hasPair = fruits.some((f) => f.id !== fruit.id && f.tier === fruit.tier && fruit.tier < 5);
        if (hasPair) {
          setSelectedId(fruit.id);
        }
        return;
      }

      if (selectedId === fruit.id) {
        // Deselect
        setSelectedId(null);
        return;
      }

      const selected = fruits.find((f) => f.id === selectedId);
      if (selected && selected.tier === fruit.tier && selected.tier < 5) {
        // Merge!
        onMerge?.(selectedId, fruit.id);
        setSelectedId(null);
      } else {
        // Select new fruit instead
        const hasPair = fruits.some((f) => f.id !== fruit.id && f.tier === fruit.tier && fruit.tier < 5);
        setSelectedId(hasPair ? fruit.id : null);
      }
    },
    [selectedId, fruits, onMerge, merging]
  );

  if (loading) {
    return (
      <div className="fruit-grid-bg rounded-xl p-4 min-h-[200px] flex items-center justify-center">
        <div className="animate-spin text-3xl">🍊</div>
      </div>
    );
  }

  if (fruits.length === 0) {
    return (
      <div className="fruit-grid-bg rounded-xl p-6 min-h-[200px] flex flex-col items-center justify-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-5xl mb-3"
        >
          🌱
        </motion.div>
        <p className="text-muted-foreground text-sm font-semibold">
          Deposit to grow your first fruit!
        </p>
      </div>
    );
  }

  // Sort by tier descending for display
  const sorted = [...fruits].sort((a, b) => b.tier - a.tier);

  // Check which tiers have mergeable pairs
  const mergeableTiers = new Set<number>();
  const tierCounts: Record<number, number> = {};
  fruits.forEach((f) => {
    tierCounts[f.tier] = (tierCounts[f.tier] || 0) + 1;
    if (tierCounts[f.tier] >= 2 && f.tier < 5) mergeableTiers.add(f.tier);
  });

  const selectedFruit = fruits.find((f) => f.id === selectedId);

  return (
    <div className="fruit-grid-bg rounded-xl p-3 min-h-[200px]">
      {mergeableTiers.size > 0 && !selectedId && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-xs font-bold text-primary mb-2"
        >
          ✨ Tap matching fruits to merge!
        </motion.p>
      )}
      {selectedId && selectedFruit && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xs font-bold text-accent mb-2"
        >
          Now tap another {getFruitInfo(selectedFruit.tier).name} to merge!
        </motion.p>
      )}
      <div className="grid grid-cols-4 gap-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((fruit, i) => {
            const info = getFruitInfo(fruit.tier);
            const isSelected = fruit.id === selectedId;
            const isMergeable = mergeableTiers.has(fruit.tier);
            const isMatchForSelected = selectedFruit && fruit.id !== selectedId && fruit.tier === selectedFruit.tier && fruit.tier < 5;

            return (
              <motion.div
                key={fruit.id ?? `${fruit.tier}-${i}`}
                layout
                // Falling entrance animation
                initial={{ y: -120, opacity: 0, scale: 0.5, rotate: Math.random() * 30 - 15 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: isSelected ? 1.15 : 1,
                  rotate: 0,
                  boxShadow: isSelected
                    ? "0 0 20px hsl(var(--primary) / 0.5)"
                    : isMatchForSelected
                    ? "0 0 12px hsl(var(--accent) / 0.4)"
                    : undefined,
                }}
                exit={
                  withdrawing
                    ? {
                        scale: [1, 1.3, 0],
                        opacity: [1, 0.8, 0],
                        rotate: [0, -20, 45],
                        filter: ["blur(0px)", "blur(0px)", "blur(4px)"],
                        transition: { duration: 0.5, ease: "easeIn" },
                      }
                    : {
                        scale: 1.8,
                        opacity: 0,
                        rotate: 15,
                        transition: { duration: 0.3, ease: "easeIn" },
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: i * 0.05,
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTap(fruit)}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl bg-card cursor-pointer select-none transition-colors ${
                  isSelected
                    ? "ring-2 ring-primary shadow-float"
                    : isMatchForSelected
                    ? "ring-2 ring-accent/60 shadow-playful"
                    : isMergeable
                    ? "shadow-playful hover:shadow-float"
                    : "shadow-sm"
                }`}
                title={`${info.name} — ₹${info.value}`}
              >
                <motion.span
                  className="text-3xl"
                  animate={
                    isSelected
                      ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }
                      : isMergeable && !selectedId
                      ? { y: [0, -3, 0] }
                      : {}
                  }
                  transition={
                    isSelected
                      ? { repeat: Infinity, duration: 0.6 }
                      : { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                  }
                >
                  {info.emoji}
                </motion.span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
