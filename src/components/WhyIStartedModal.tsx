import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/hooks/useGoals";
import { useGoalImages, getGoalImageUrl } from "@/hooks/useGoalImages";

interface WhyIStartedModalProps {
  goal: Goal;
  visible: boolean;
  onClose: () => void;
  onAddMotivation: () => void;
}

export default function WhyIStartedModal({ goal, visible, onClose, onAddMotivation }: WhyIStartedModalProps) {
  const { data: goalImages } = useGoalImages(goal.id);
  const hasMotivation = !!goal.motivation_text || (goalImages && goalImages.length > 0);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-4 bg-card rounded-2xl p-6 shadow-float max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-lg font-black text-foreground text-center mb-4">
              🪞 Why I Started
            </h3>

            {hasMotivation ? (
              <div className="space-y-4">
                {goalImages && goalImages.length > 0 && (
                  <div className={`grid gap-2 ${
                    goalImages.length === 1 ? "grid-cols-1" : goalImages.length === 2 ? "grid-cols-2" : "grid-cols-3"
                  }`}>
                    {goalImages.map((img, i) => (
                      <motion.div
                        key={img.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-xl overflow-hidden aspect-square border border-border"
                      >
                        <img
                          src={getGoalImageUrl(img.image_path)}
                          alt="Motivation"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {goal.motivation_text && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm text-foreground font-semibold text-center italic leading-relaxed bg-muted/50 rounded-xl p-4"
                  >
                    "{goal.motivation_text}"
                  </motion.p>
                )}

                <button
                  onClick={onAddMotivation}
                  className="w-full py-2 text-xs font-bold text-primary hover:underline"
                >
                  ✏️ Edit Motivation
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">📸</div>
                <p className="text-muted-foreground text-sm font-semibold mb-4">
                  No motivation added yet
                </p>
                <button
                  onClick={onAddMotivation}
                  className="px-6 py-2.5 rounded-xl btn-deposit text-primary-foreground font-bold text-sm"
                >
                  Add Motivation ✨
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-4 py-2 text-xs font-bold text-muted-foreground"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
