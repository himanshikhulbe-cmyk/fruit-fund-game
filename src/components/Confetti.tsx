import { motion } from "framer-motion";
import { useMemo } from "react";

const EMOJIS = ["🎉", "🍒", "🍓", "🍊", "🥭", "⭐", "💰", "🎊", "✨"];

export default function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "100vh", x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ y: "-20vh", opacity: 0, rotate: 720, scale: 0.5 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute text-2xl"
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
