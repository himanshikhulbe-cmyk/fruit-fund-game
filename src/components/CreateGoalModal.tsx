import { useState, useRef } from "react";
import { useCreateGoal } from "@/hooks/useGoals";
import { useUploadGoalImages } from "@/hooks/useGoalImages";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, X } from "lucide-react";
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
  const [priority, setPriority] = useState<number>(1);
  const [motivationText, setMotivationText] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createGoal = useCreateGoal();
  const uploadImages = useUploadGoalImages();

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newPhotos = [...photos, ...files].slice(0, 5); // max 5
    setPhotos(newPhotos);
    // Generate previews
    const previews = newPhotos.map((f) => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (idx: number) => {
    const newPhotos = photos.filter((_, i) => i !== idx);
    setPhotos(newPhotos);
    URL.revokeObjectURL(photoPreviews[idx]);
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseInt(target);
    if (!name || targetNum < 100) return;
    const goal = await createGoal.mutateAsync({
      name,
      target_amount: targetNum,
      icon,
      deadline: deadline ? format(deadline, "yyyy-MM-dd") : undefined,
      priority,
      motivation_text: motivationText.trim() || undefined,
    });
    // Upload photos if any
    if (photos.length > 0 && goal.id) {
      await uploadImages.mutateAsync({ goalId: goal.id, files: photos });
    }
    onClose();
  };

  const isSubmitting = createGoal.isPending || uploadImages.isPending;

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
                  captionLayout="dropdown-buttons"
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 30}
                  classNames={{
                    caption_label: "hidden",
                    caption_dropdowns: "flex gap-2",
                    nav: "hidden",
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Priority</label>
            <div className="flex gap-2">
              {[
                { value: 1, label: "🔴 High", style: "bg-destructive/15 text-destructive border-destructive/30" },
                { value: 2, label: "🟡 Medium", style: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
                { value: 3, label: "🟢 Low", style: "bg-accent/15 text-accent border-accent/30" },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                    priority === p.value
                      ? p.style + " ring-2 ring-offset-1 ring-primary/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Motivation Photos */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">
              📸 Motivation Photos (optional, max 5)
            </label>
            <div className="flex gap-2 flex-wrap">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img src={src} alt="Motivation" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 bg-foreground/70 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3 text-background" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted hover:border-primary/50 transition-colors"
                >
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoAdd}
              className="hidden"
            />
          </div>

          {/* Motivation Text */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">
              💬 Note to Future You (optional)
            </label>
            <textarea
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              placeholder="Write something motivating... Why is this goal important to you?"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            {motivationText.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-right mt-0.5">
                {motivationText.length}/500
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Goal 🌱"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
