import { motion } from "framer-motion";
import { Goal } from "@/hooks/useGoals";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Milestone {
  week: number;
  target: number;
  cumulative: number;
  done: boolean;
  current: boolean;
}

function buildMilestones(goal: Goal): Milestone[] {
  if (!goal.deadline) return [];
  const start = new Date(goal.created_at);
  const end = new Date(goal.deadline);
  const totalMs = end.getTime() - start.getTime();
  const totalWeeks = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24 * 7)));
  
  // Distribute remainder across early weeks so cumulative always equals target
  const base = Math.floor(goal.target_amount / totalWeeks);
  const remainder = goal.target_amount % totalWeeks;

  const milestones: Milestone[] = [];
  let cumulative = 0;
  for (let i = 0; i < totalWeeks; i++) {
    const weekTarget = base + (i < remainder ? 1 : 0);
    cumulative += weekTarget;
    const prevCumulative = cumulative - weekTarget;
    milestones.push({
      week: i + 1,
      target: weekTarget,
      cumulative,
      done: goal.current_amount >= cumulative,
      current: goal.current_amount < cumulative && goal.current_amount >= prevCumulative,
    });
  }
  return milestones;
}

export default function GoalMilestones({ goal }: { goal: Goal }) {
  const milestones = buildMilestones(goal);
  if (milestones.length === 0) return null;

  const currentIdx = milestones.findIndex((m) => m.current);

  return (
    <div className="px-4 mt-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="card-playful p-4"
      >
        <Accordion type="single" collapsible defaultValue="milestones">
          <AccordionItem value="milestones" className="border-none">
            <AccordionTrigger className="py-0 hover:no-underline">
              <h3 className="text-sm font-bold text-foreground">🏁 Weekly Milestones</h3>
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-0">
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {milestones.map((m) => {
                  const pct = Math.min(100, (goal.current_amount / m.cumulative) * 100);
                  return (
                    <div
                      key={m.week}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                        m.done
                          ? "bg-accent/10"
                          : m.current
                          ? "bg-primary/10 ring-1 ring-primary/30"
                          : "bg-muted/40"
                      }`}
                    >
                      <span className="text-base">
                        {m.done ? "✅" : m.current ? "👉" : "⬜"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-foreground">
                            Week {m.week}
                          </span>
                          <span className="text-muted-foreground font-semibold">
                            ₹{m.target.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${m.done ? "bg-accent" : "bg-primary"}`}
                            style={{ width: `${m.done ? 100 : m.current ? pct : 0}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                          Cumulative: ₹{m.cumulative.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>
    </div>
  );
}
