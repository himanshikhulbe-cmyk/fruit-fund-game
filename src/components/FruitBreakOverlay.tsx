import { motion, AnimatePresence } from "framer-motion";
import { getFruitInfo } from "@/utils/fruitLogic";

interface FruitBreakOverlayProps {
  visible: boolean;
  /** The tier of the fruit being removed/broken */
  tier: number;
  /** Amount being withdrawn */
  amount: number;
}

const shardAngles = [0, 60, 120, 180, 240, 300];

export default function FruitBreakOverlay({ visible, tier, amount }: FruitBreakOverlayProps) {
  const info = getFruitInfo(tier);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
        >
          <div className="relative flex flex-col items-center">
            {/* Main fruit that cracks */}
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: [1, 1.3, 1.3, 0],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 1.2, times: [0, 0.3, 0.5, 1], ease: "easeInOut" }}
              className="text-8xl"
            >
              {info.emoji}
            </motion.div>

            {/* Crack lines overlaid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.2, times: [0, 0.3, 0.5, 0.7] }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl"
              style={{ filter: "brightness(0.5)" }}
            >
              💥
            </motion.div>

            {/* Flying shards */}
            {shardAngles.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = Math.cos(rad) * 120;
              const y = Math.sin(rad) * 120;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                  animate={{
                    x: [0, x * 0.3, x],
                    y: [0, y * 0.3 - 20, y + 40],
                    opacity: [0, 1, 0],
                    scale: [0.5, 0.8, 0.3],
                    rotate: [0, angle * 0.5, angle],
                  }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 text-2xl"
                  style={{ marginLeft: -12, marginTop: -12 }}
                >
                  {info.emoji}
                </motion.div>
              );
            })}

            {/* Withdrawal amount text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 0, 1], y: [20, 20, 0] }}
              transition={{ duration: 1.4, times: [0, 0.6, 1] }}
              className="mt-8 text-center"
            >
              <p className="text-2xl font-black text-destructive-foreground drop-shadow-lg">
                -₹{amount.toLocaleString()}
              </p>
              <p className="text-sm font-bold text-destructive-foreground/70 mt-1 drop-shadow">
                Fruit broken! 💔
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
