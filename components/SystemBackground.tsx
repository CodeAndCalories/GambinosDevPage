"use client";

import { motion } from "framer-motion";

export default function SystemBackground() {
  return (
    // BUG FIX: Added -z-20 (was no z-index set).
    // Stack: SystemBackground (-z-20) → NetworkBackground (-z-10) → content (z-10)
    <div className="absolute inset-0 overflow-hidden -z-20">

      {/* animated grid */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#00ff9c22 1px, transparent 1px), linear-gradient(90deg,#00ff9c22 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "0px 40px"]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* scanning line */}
      <motion.div
        className="absolute w-full h-1 bg-green-400/40"
        animate={{
          y: ["-10%", "110%"]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* glow center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00ff9c22,transparent_60%)]" />

    </div>
  );
}
