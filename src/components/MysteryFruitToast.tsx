import { motion, AnimatePresence } from "framer-motion";
import { getMysteryFruitInfo } from "@/utils/fruitLogic";

interface MysteryFruitToastProps {
  visible: boolean;
  specialType: string;
  onClose: () => void;
}

export default function MysteryFruitToast({ visible, specialType, onClose }: MysteryFruitToastProps) {
  const info = getMysteryFruitInfo(specialType);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-card border-2 border-accent rounded-2xl px-6 py-4 shadow-float text-center"
          onClick={onClose}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 2 }}
            className="text-5xl mb-2"
          >
            {info.emoji}
          </motion.div>
          <p className="text-sm font-black text-foreground">Mystery Fruit!</p>
          <p className="text-xs font-bold text-accent">{info.name} unlocked! ✨</p>
          <p className="text-[10px] text-muted-foreground mt-1">Tap to dismiss</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
