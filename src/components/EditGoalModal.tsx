import { useState, useRef } from "react";
import { Goal, useUpdateGoal } from "@/hooks/useGoals";
import { useUploadGoalImages } from "@/hooks/useGoalImages";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FRUIT_TIERS, AVAILABLE_FRUIT_EMOJIS, CustomFruitValues, CustomFruitEmojis } from "@/utils/fruitLogic";

interface EditGoalModalProps {
  goal: Goal;
  onClose: () => void;
}

export default function EditGoalModal({ goal, onClose }: EditGoalModalProps) {
  const [target, setTarget] = useState(String(goal.target_amount));
  const [deadline, setDeadline] = useState<Date | undefined>(goal.deadline ? new Date(goal.deadline) : undefined);
  const [motivationText, setMotivationText] = useState(goal.motivation_text ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showFruitCustom, setShowFruitCustom] = useState(false);

  // Custom fruit values
  const defaultValues: CustomFruitValues = {};
  FRUIT_TIERS.forEach((ft) => { defaultValues[ft.tier] = ft.value; });
  const [fruitValues, setFruitValues] = useState<CustomFruitValues>(
    goal.custom_fruit_values ?? defaultValues
  );

  // Custom fruit emojis
  const defaultEmojis = FRUIT_TIERS.map((ft) => ft.emoji);
  const [fruitEmojis, setFruitEmojis] = useState<CustomFruitEmojis>(
    goal.custom_fruit_emojis ?? defaultEmojis
  );
  const [editingEmojiTier, setEditingEmojiTier] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateGoal = useUpdateGoal();
  const uploadImages = useUploadGoalImages();

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);
    setPhotoPreviews(newPhotos.map((f) => URL.createObjectURL(f)));
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
    if (targetNum < 100) return;

    const isDefaultValues = FRUIT_TIERS.every((ft) => fruitValues[ft.tier] === ft.value);
    const isDefaultEmojis = FRUIT_TIERS.every((ft, i) => fruitEmojis[i] === ft.emoji);

    await updateGoal.mutateAsync({
      goalId: goal.id,
      updates: {
        target_amount: targetNum,
        deadline: deadline ? format(deadline, "yyyy-MM-dd") : null,
        motivation_text: motivationText.trim() || null,
        custom_fruit_values: isDefaultValues ? null : fruitValues,
        custom_fruit_emojis: isDefaultEmojis ? null : fruitEmojis,
      },
    });

    if (photos.length > 0) {
      await uploadImages.mutateAsync({ goalId: goal.id, files: photos });
    }

    onClose();
  };

  const isSubmitting = updateGoal.isPending || uploadImages.isPending;

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
        <h2 className="text-lg font-black text-foreground mb-4">Edit Goal ✏️</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            <label className="text-xs font-bold text-muted-foreground mb-1 block">Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full justify-start text-left font-semibold text-sm", !deadline && "text-muted-foreground")}
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
                  classNames={{ caption_label: "hidden", caption_dropdowns: "flex gap-2", nav: "hidden" }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Motivation Text */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">💬 Note to Future You</label>
            <textarea
              value={motivationText}
              onChange={(e) => setMotivationText(e.target.value)}
              placeholder="Why is this goal important?"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Add more photos */}
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">📸 Add More Photos</label>
            <div className="flex gap-2 flex-wrap">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                  <img src={src} alt="Motivation" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 bg-foreground/70 rounded-full p-0.5">
                    <X className="w-3 h-3 text-background" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted hover:border-primary/50 transition-colors">
                  <ImagePlus className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoAdd} className="hidden" />
          </div>

          {/* Fruit Customization Toggle */}
          <button
            type="button"
            onClick={() => setShowFruitCustom(!showFruitCustom)}
            className="w-full text-left text-xs font-bold text-primary py-2"
          >
            {showFruitCustom ? "▼" : "▶"} Customize Fruit Tiers
          </button>

          {showFruitCustom && (
            <div className="space-y-2 bg-muted/50 rounded-xl p-3">
              {FRUIT_TIERS.map((ft, i) => (
                <div key={ft.tier} className="flex items-center gap-2">
                  {/* Emoji picker */}
                  <button
                    type="button"
                    onClick={() => setEditingEmojiTier(editingEmojiTier === ft.tier ? null : ft.tier)}
                    className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg bg-card border border-border"
                  >
                    {fruitEmojis[i]}
                  </button>
                  <span className="text-xs font-bold text-muted-foreground w-12">Tier {ft.tier}</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={fruitValues[ft.tier]}
                      onChange={(e) => setFruitValues({ ...fruitValues, [ft.tier]: parseInt(e.target.value) || 0 })}
                      min={1}
                      className="w-full px-2 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder={`₹${ft.value}`}
                    />
                  </div>
                </div>
              ))}

              {/* Emoji picker dropdown */}
              {editingEmojiTier !== null && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="grid grid-cols-6 gap-1.5 bg-card rounded-lg p-2 border border-border overflow-hidden"
                >
                  {AVAILABLE_FRUIT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => {
                        const idx = editingEmojiTier - 1;
                        const newEmojis = [...fruitEmojis];
                        newEmojis[idx] = e;
                        setFruitEmojis(newEmojis);
                        setEditingEmojiTier(null);
                      }}
                      className="text-xl p-1 rounded hover:bg-primary/10 transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl btn-deposit text-primary-foreground font-bold text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes ✅"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
