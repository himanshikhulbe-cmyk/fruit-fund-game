import { useState } from "react";
import { useCreateGoal } from "@/hooks/useGoals";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EMOJI_OPTIONS = [
  "🎯", "📚", "✈️", "🏥", "📱", "🆘", "🎮", "🏠", "🚗", "💍",
  "🎓", "🏖️", "🎸", "🐶", "👶", "💻", "📷", "🎨", "⚽", "🧳",
  "🎁", "🍕", "☕", "🛍️", "💎", "🏋️", "🎬", "🎤", "🌍", "🔧",
];

const GOAL_PRESETS = [
  { name: "Education", icon: "📚" },
  { name: "Travel", icon: "✈️" },
  { name: "Healthcare", icon: "🏥" },
  { name: "Gadgets", icon: "📱" },
  { name: "Emergency", icon: "🆘" },
  { name: "Fun", icon: "🎮" },
];

interface CreateGoalModalProps {
  onClose: () => void;
}

export default function CreateGoalModal({ onClose }: CreateGoalModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [target, setTarget] = useState("1000");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const createGoal = useCreateGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(target);
    if (!name || targetNum < 100) return;
    await createGoal.mutateAsync({
      name,
      target_amount: targetNum,
      icon,
      deadline: deadline ? format(deadline, "yyyy-MM-dd") : undefined,
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto"
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-black text-foreground mb-4">New Savings Goal 🎯</h2>

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {GOAL_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => { setName(p.name); setIcon(p.icon); }}
              className={`p-2 rounded-lg text-sm font-bold text-center transition-all ${
                name === p.name
                  ? "bg-primary text-primary-foreground shadow-playful"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <br />
              {p.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Icon picker */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Icon</label>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-sm font-semibold"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-muted-foreground">Tap to change</span>
            </button>
            {showEmojiPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-2 grid grid-cols-6 gap-2 bg-muted rounded-lg p-3 overflow-hidden"
              >
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => { setIcon(e); setShowEmojiPicker(false); }}
                    className={`text-2xl p-1 rounded-lg transition-all ${
                      icon === e ? "bg-primary/20 scale-110" : "hover:bg-primary/10"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goal name"
            required
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Target Amount (₹)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              min={100}
              required
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Target Deadline (optional)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-semibold text-sm",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : "Pick a deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <button
            type="submit"
            disabled={createGoal.isPending}
            className="w-full py-3 rounded-xl btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50"
          >
            {createGoal.isPending ? "Creating..." : "Create Goal 🌱"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
