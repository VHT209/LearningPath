"use client";

import * as React from "react";
import { motion } from "framer-motion";

// light-mode counterpart to <Meteors />. drifting paper planes in blue + yellow,
// gentle floating motion (not falling like meteors). colors come from theme
// vars so they track --primary and --foreground if the palette ever changes.

type Plane = {
  top: string;
  left: string;
  rotation: number;
  color: "blue" | "yellow";
  size: number;
  delay: number;
  duration: number;
};

// speedScale multiplies the drift duration so callers can vary the feel
// (e.g. dashboard footer drifts slightly slower than the landing hero).
export function OrigamiPlanes({
  number = 14,
  speedScale = 1,
}: {
  number?: number;
  speedScale?: number;
}) {
  const [planes, setPlanes] = React.useState<Plane[]>([]);

  React.useEffect(() => {
    setPlanes(
      Array.from({ length: number }, (_, i) => ({
        top: `${(i * 17 + 5) % 85}%`,
        left: `${(i * 31 + 7) % 85}%`,
        rotation: (i * 47) % 360,
        color: i % 2 === 0 ? "blue" : "yellow",
        size: 28 + ((i * 7) % 18), // 28-46px so depth varies
        delay: (i * 0.4) % 6,
        duration: (14 + ((i * 1.3) % 6)) * speedScale, // 14-20s baseline for slow drift
      }))
    );
  }, [number, speedScale]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {planes.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
          initial={{ rotate: p.rotation, opacity: 0 }}
          animate={{
            x: [0, 30, -10, 20, 0],
            y: [0, -15, 5, -10, 0],
            rotate: [
              p.rotation,
              p.rotation + 12,
              p.rotation - 6,
              p.rotation + 4,
              p.rotation,
            ],
            opacity: [0, 0.85, 0.85, 0.85, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <PaperPlane color={p.color} />
        </motion.div>
      ))}
    </div>
  );
}

function PaperPlane({ color }: { color: "blue" | "yellow" }) {
  // CSS vars so the plane colors follow the theme palette
  const fill = color === "blue" ? "var(--primary)" : "var(--foreground)";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
    >
      {/* main plane shape */}
      <path d="M2 12L22 3L13 22L11 13L2 12Z" fill={fill} />
      {/* fold lines for the origami feel */}
      <path
        d="M2 12L11 13L13 22"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 3L11 13"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="0.4"
        fill="none"
      />
    </svg>
  );
}
