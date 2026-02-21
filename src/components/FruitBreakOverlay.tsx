import { motion, AnimatePresence } from "framer-motion";
import { getFruitInfo } from "@/utils/fruitLogic";

interface FruitBreakOverlayProps {
  visible: boolean;
  tier: number;
  amount: number;
  motivationText?: string | null;
  motivationImages?: string[];
}

const shardAngles = [0, 60, 120, 180, 240, 300];

export default function FruitBreakOverlay({
  visible,
  tier,
  amount,
  motivationText,
  motivationImages,
}: FruitBreakOverlayProps) {
  const info = getFruitInfo(tier);
  const hasMotivation = !!motivationText || (motivationImages && motivationImages.length > 0);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm overflow-y-auto py-8"
        >
          <div className="relative flex flex-col items-center max-w-sm mx-4">
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
              style={{ filter: "brightness(0.5)", marginTop: -40 }}
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
                  initial={{ x: 0, y: -40, opacity: 0, scale: 0.5 }}
                  animate={{
                    x: [0, x * 0.3, x],
                    y: [-40, y * 0.3 - 60, y],
                    opacity: [0, 1, 0],
                    scale: [0.5, 0.8, 0.3],
                    rotate: [0, angle * 0.5, angle],
                  }}
                  transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 text-2xl"
                  style={{ marginLeft: -12, marginTop: -52 }}
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
              className="mt-4 text-center"
            >
              <p className="text-2xl font-black text-destructive-foreground drop-shadow-lg">
                -₹{amount.toLocaleString()}
              </p>
              <p className="text-sm font-bold text-destructive-foreground/70 mt-1 drop-shadow">
                Fruit broken! 💔
              </p>
            </motion.div>

            {/* Motivation section */}
            {hasMotivation && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: [0, 0, 0, 1], y: [30, 30, 30, 0] }}
                transition={{ duration: 2, times: [0, 0.4, 0.7, 1] }}
                className="mt-6 w-full"
              >
                <div className="bg-card/90 backdrop-blur-md rounded-2xl p-4 border border-border shadow-float">
                  <p className="text-xs font-bold text-primary text-center mb-3">
                    🪞 Remember why you started...
                  </p>

                  {/* Motivation Images */}
                  {motivationImages && motivationImages.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${
                      motivationImages.length === 1
                        ? "grid-cols-1"
                        : motivationImages.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}>
                      {motivationImages.map((url, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.6 + i * 0.15 }}
                          className="rounded-xl overflow-hidden aspect-square border border-border"
                        >
                          <img
                            src={url}
                            alt="Your motivation"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Motivation Text */}
                  {motivationText && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 }}
                      className="text-sm text-foreground font-semibold text-center italic leading-relaxed"
                    >
                      "{motivationText}"
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
