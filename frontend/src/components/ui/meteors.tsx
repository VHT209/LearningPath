"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

//modification code from Aceternity UI
// speedScale multiplies the per-meteor duration, so callers can vary the feel
// without forking the keyframes (e.g. dashboard header is slightly slower than
// the landing's hero so the same effect reads as distinct).
export const Meteors = ({
  number = 40,
  className,
  speedScale = 1,
}: {
  number?: number;
  className?: string;
  speedScale?: number;
}) => {
  const [meteors, setMeteors] = React.useState<
    { top: string; left: string; delay: string; duration: string }[]
  >([]);

  React.useEffect(() => {
    setMeteors(
      Array.from({ length: number }, (_, idx) => ({
        top: "-10%",
        left: `${(idx * 61) % 100}%`,
        delay: `${(idx * 0.35) % 5}s`,
        duration: `${(5 + ((idx * 0.7) % 5)) * speedScale}s`,
      }))
    );
  }, [number, speedScale]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {meteors.map((meteor, idx) => (
        <span
          key={idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-full bg-slate-500",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:bg-gradient-to-r before:from-slate-500 before:to-transparent before:content-['']",
            className
          )}
          style={{
            top: meteor.top,
            left: meteor.left,
            animationDelay: meteor.delay,
            animationDuration: meteor.duration,
          }}
        />
      ))}
    </motion.div>
  );
};