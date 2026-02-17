import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

interface BottomNavProps {
  onAddGoal: () => void;
  canCreate: boolean;
}

export default function BottomNav({ onAddGoal, canCreate }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: 60 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-float z-50"
    >
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 ${
            location.pathname === "/" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onAddGoal}
          disabled={!canCreate}
          className="btn-deposit px-6 py-2.5 rounded-xl text-primary-foreground font-bold text-sm -mt-4 disabled:opacity-40"
        >
          + Add Goal
        </motion.button>

        <button className="flex flex-col items-center gap-0.5 py-1 px-3 text-muted-foreground">
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </div>
    </motion.div>
  );
}
