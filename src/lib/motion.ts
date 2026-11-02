import type { Variants } from "motion/react";

export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.16,
    exit: 0.18,
    standard: 0.24,
    considered: 0.48,
    reveal: 0.6,
    scene: 0.9,
  },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    exit: [0.7, 0, 0.84, 0],
    standard: [0.22, 1, 0.36, 1],
    inOut: [0.65, 0, 0.35, 1],
  },
  spring: {
    responsive: { type: "spring", stiffness: 520, damping: 44 },
    gentle: { type: "spring", stiffness: 340, damping: 34 },
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0 },
    smooth: { type: "spring", visualDuration: 0.4, bounce: 0 },
    morph: { type: "spring", visualDuration: 0.42, bounce: 0 },
    panel: { type: "spring", visualDuration: 0.42, bounce: 0.04 },
  },
  stagger: { char: 0.016, word: 0.04, line: 0.08, item: 0.06 },
  blur: { subtle: 2, soft: 4, text: 8 },
} as const;

export const VIEWPORT = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -8% 0px",
} as const;

export const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionTokens.stagger.item,
      delayChildren: 0.04,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.considered,
      ease: [...motionTokens.ease.standard],
    },
  },
};

export const lineVariants: Variants = {
  hidden: { y: "105%" },
  visible: {
    y: "0%",
    transition: {
      duration: motionTokens.duration.scene,
      ease: [...motionTokens.ease.enter],
    },
  },
};
