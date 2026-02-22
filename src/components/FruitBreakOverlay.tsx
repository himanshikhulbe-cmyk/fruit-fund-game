import { motion, AnimatePresence } from "framer-motion";
import { getFruitInfo, CustomFruitValues, CustomFruitEmojis } from "@/utils/fruitLogic";

interface FruitBreakOverlayProps {
  visible: boolean;
  tier: number;
  amount: number;
  motivationText?: string | null;
  motivationImages?: string[];
  customFruitValues?: CustomFruitValues | null;
  customFruitEmojis?: CustomFruitEmojis | null;
  isFunFund?: boolean;
}

const shardAngles = [0, 45, 90, 135, 180, 225, 270, 315];

export default function FruitBreakOverlay({
  visible,
  tier,
  amount,
  motivationText,
  motivationImages,
  customFruitValues,
  customFruitEmojis,
  isFunFund,
}: FruitBreakOverlayProps) {
  const info = getFruitInfo(tier, customFruitValues, customFruitEmojis);
  const hasMotivation = !isFunFund && (!!motivationText || (motivationImages && motivationImages.length > 0));

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
            {/* Main fruit: enlarge → shake → crack → fade */}
            <motion.div
              initial={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
              animate={{
                scale: [1, 1.5, 1.5, 1.5, 1.5, 0],
                rotate: [0, 0, -8, 8, -6, 0],
                filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(4px)"],
              }}
              transition={{
                duration: 0.6,
                times: [0, 0.15, 0.25, 0.4, 0.55, 1],
                ease: "easeInOut",
              }}
              className="text-8xl"
            >
              {info.emoji}
            </motion.div>

            {/* Crack overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0, 0, 1, 1, 0],
                scale: [0.5, 0.5, 1.2, 1.4, 1.6],
              }}
              transition={{ duration: 0.6, times: [0, 0.2, 0.35, 0.5, 0.7] }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl pointer-events-none"
              style={{ marginTop: -40 }}
            >
              💥
            </motion.div>

            {/* Flying shards — 8 directions for more dramatic effect */}
            {shardAngles.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const dist = 100 + Math.random() * 60;
              const x = Math.cos(rad) * dist;
              const y = Math.sin(rad) * dist;
              return (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: -40, opacity: 0, scale: 0.6 }}
                  animate={{
                    x: [0, x * 0.2, x],
                    y: [-40, y * 0.2 - 50, y + 30],
                    opacity: [0, 1, 0],
                    scale: [0.6, 0.9, 0.2],
                    rotate: [0, angle * 0.3, angle],
                  }}
                  transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 text-xl pointer-events-none"
                  style={{ marginLeft: -10, marginTop: -50 }}
                >
                  {info.emoji}
                </motion.div>
              );
            })}

            {/* Amount text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: [0, 0, 1], y: [20, 20, 0] }}
              transition={{ duration: 1, times: [0, 0.6, 1] }}
              className="mt-4 text-center"
            >
              <p className="text-2xl font-black text-destructive-foreground drop-shadow-lg">
                -₹{amount.toLocaleString()}
              </p>
              <p className="text-sm font-bold text-destructive-foreground/70 mt-1 drop-shadow">
                {isFunFund ? "Enjoy! 🎉" : "Fruit broken! 💔"}
              </p>
            </motion.div>

            {/* Motivation section (not for fun fund) */}
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

                  {motivationImages && motivationImages.length > 0 && (
                    <div className={`grid gap-2 mb-3 ${
                      motivationImages.length === 1 ? "grid-cols-1" : motivationImages.length === 2 ? "grid-cols-2" : "grid-cols-3"
                    }`}>
                      {motivationImages.map((url, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.6 + i * 0.15 }}
                          className="rounded-xl overflow-hidden aspect-square border border-border"
                        >
                          <img src={url} alt="Your motivation" className="w-full h-full object-cover" />
                        </motion.div>
                      ))}
                    </div>
                  )}

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
