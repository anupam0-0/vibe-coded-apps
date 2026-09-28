"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function MotionReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.46, delay, ease: [0.2, 0.8, 0.2, 1] }}>{children}</motion.div>;
}
