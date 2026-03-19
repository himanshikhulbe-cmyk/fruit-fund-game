import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    id: "basics",
    label: "🌱 Saving Basics",
    items: [
      "Create goals with a name, target amount, and optional deadline",
      "Deposit ₹10–₹200 at a time to build your savings",
      "Track progress with visual fruit evolution",
      "Set priorities (High/Med/Low) to focus your savings",
    ],
  },
  {
    id: "fruits",
    label: "🍒 Fruit System",
    items: [
      "Each deposit creates cherry fruits (Tier 1)",
      "Tap two matching fruits to merge them into a higher tier",
      "Tiers: 🍒 Cherry → 🍓 Strawberry → 🍊 Orange → 🥭 Mango → 🍈 Dragon Fruit",
      "Mystery fruits (⭐🌈🔮) appear randomly — collect them all!",
      "Your goal evolves: Seedling 🌱 → Sprouting 🌾 → Growing 🌿 → Blooming 🌸",
    ],
  },
  {
    id: "tokens",
    label: "🪙 Tokens & Rewards",
    items: [
      "Earn +2 tokens at 50% progress",
      "Earn +3 tokens at 70% progress",
      "Earn +5 tokens when goal is complete",
      "Spend tokens in the Fruit Market for collectibles",
    ],
  },
  {
    id: "circles",
    label: "👥 Circles & FriendFund",
    items: [
      "Create a circle and invite friends with a code",
      "Set shared goals and contribute together",
      "See who's saving the most on the leaderboard",
      "Fruits evolve based on total group progress",
    ],
  },
  {
    id: "modes",
    label: "🔒 FD & RD Modes",
    items: [
      "Fixed Deposit (FD): Lock your savings until maturity date",
      "Recurring Deposit (RD): Commit to monthly saving discipline",
      "Flexible: Deposit and withdraw anytime",
      "FD rewards you with mystical fruits on completion!",
    ],
  },
];

export default function HowItWorksSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {SECTIONS.map((s) => (
        <div key={s.id}>
          <button
            onClick={() => setOpenId(openId === s.id ? null : s.id)}
            className="w-full flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2.5 text-left"
          >
            <span className="text-sm font-bold text-foreground">{s.label}</span>
            <span className="text-xs text-muted-foreground">{openId === s.id ? "▼" : "▶"}</span>
          </button>
          <AnimatePresence>
            {openId === s.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <ul className="px-3 py-2 space-y-1.5">
                  {s.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
