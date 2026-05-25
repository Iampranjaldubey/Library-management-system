/**
 * Centralized animation tokens.
 * All durations, easings, and variants live here so every component
 * stays visually consistent without duplicating magic numbers.
 *
 * Rules:
 *  - Only animate `opacity`, `transform` (translate/scale/rotate) — GPU-only.
 *  - Keep durations short: UI is not a movie.
 *  - Respect `prefers-reduced-motion` via the `reducedMotion` helpers.
 */

import type { Variants, Transition } from "framer-motion"

// ─── Easings ──────────────────────────────────────────────────────────────────

export const ease = {
  /** General-purpose: enter + exit */
  standard:    [0.4, 0.0, 0.2, 1] as number[],
  /** Entering elements — decelerates into place */
  enter:       [0.0, 0.0, 0.2, 1] as number[],
  /** Exiting elements — accelerates out */
  exit:        [0.4, 0.0, 1.0, 1] as number[],
  /** Snappy spring — buttons, icons */
  spring:      { type: "spring", stiffness: 420, damping: 30 } as const,
  /** Gentle spring — cards, panels */
  softSpring:  { type: "spring", stiffness: 280, damping: 26 } as const,
}

// Keep old name for backward compat
export const easings = {
  standard:    ease.standard,
  emphasized:  ease.enter,
  decelerated: ease.enter,
  accelerated: ease.exit,
  spring:      ease.spring,
  smoothSpring: ease.softSpring,
}

// ─── Durations (seconds) ──────────────────────────────────────────────────────

export const dur = {
  instant: 0.10,
  fast:    0.15,
  base:    0.22,
  slow:    0.35,
  slower:  0.50,
}

// Keep old name for backward compat
export const durations = {
  fast:   dur.fast,
  normal: dur.base,
  slow:   dur.slow,
  slower: dur.slower,
}

// ─── Shared transitions ───────────────────────────────────────────────────────

export const t = {
  base:  { duration: dur.base,  ease: ease.standard } satisfies Transition,
  enter: { duration: dur.slow,  ease: ease.enter    } satisfies Transition,
  exit:  { duration: dur.fast,  ease: ease.exit     } satisfies Transition,
  fast:  { duration: dur.fast,  ease: ease.standard } satisfies Transition,
}

// ─── Page transitions ─────────────────────────────────────────────────────────

export const pageTransition: Transition = t.base

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0,  transition: t.enter },
  exit:    { opacity: 0, y: -6, transition: t.exit  },
}

// ─── Fade ─────────────────────────────────────────────────────────────────────

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: t.base },
  exit:    { opacity: 0, transition: t.fast },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0,  transition: t.enter },
  exit:    { opacity: 0, y: -8, transition: t.exit  },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0,  transition: t.enter },
  exit:    { opacity: 0, y: 8,  transition: t.exit  },
}

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0,  transition: t.enter },
  exit:    { opacity: 0, x: 8,  transition: t.exit  },
}

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0,  transition: t.enter },
  exit:    { opacity: 0, x: -8, transition: t.exit  },
}

// ─── Scale ────────────────────────────────────────────────────────────────────

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1,    transition: t.enter },
  exit:    { opacity: 0, scale: 0.96, transition: t.exit  },
}

export const scaleInCenter: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1,    transition: t.enter },
  exit:    { opacity: 0, scale: 0.92, transition: t.exit  },
}

// ─── Modals ───────────────────────────────────────────────────────────────────

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: dur.base } },
  exit:    { opacity: 0, transition: { duration: dur.fast } },
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: dur.slow, ease: ease.enter },
  },
  exit: {
    opacity: 0, scale: 0.96, y: 8,
    transition: { duration: dur.fast, ease: ease.exit },
  },
}

// ─── Slide ────────────────────────────────────────────────────────────────────

export const slideInFromRight: Variants = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0,      opacity: 1, transition: t.enter },
  exit:    { x: "100%", opacity: 0, transition: t.exit  },
}

export const slideInFromLeft: Variants = {
  initial: { x: "-100%", opacity: 0 },
  animate: { x: 0,       opacity: 1, transition: t.enter },
  exit:    { x: "-100%", opacity: 0, transition: t.exit  },
}

export const slideInFromTop: Variants = {
  initial: { y: "-100%", opacity: 0 },
  animate: { y: 0,       opacity: 1, transition: t.enter },
  exit:    { y: "-100%", opacity: 0, transition: t.exit  },
}

export const slideInFromBottom: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: { y: 0,      opacity: 1, transition: t.enter },
  exit:    { y: "100%", opacity: 0, transition: t.exit  },
}

// ─── Lists / stagger ──────────────────────────────────────────────────────────

/** Parent: apply to the container */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
}

/** Child: apply to each item */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: dur.slow, ease: ease.enter } },
  exit:    { opacity: 0, y: -6,             transition: t.fast },
}

/** Lighter stagger for table rows — no vertical shift, just fade */
export const tableRow: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: dur.base } },
  exit:    { opacity: 0, transition: { duration: dur.fast } },
}

/** Stagger container for table rows — tighter timing */
export const tableContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.03, delayChildren: 0 },
  },
}

// ─── Cards ────────────────────────────────────────────────────────────────────

/** Entrance for a grid of cards */
export const cardEntrance: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: dur.slow, ease: ease.enter },
  },
}

/** whileHover target for cards */
export const cardHover = {
  y: -3,
  scale: 1.015,
  transition: ease.softSpring,
}

/** whileTap target for cards */
export const cardTap = {
  scale: 0.985,
  transition: { duration: 0.1 },
}

// ─── Buttons / icons ──────────────────────────────────────────────────────────

export const hoverScale = { scale: 1.04, transition: ease.spring }
export const hoverLift  = { y: -2,       transition: ease.softSpring }
export const tapScale   = { scale: 0.96, transition: { duration: 0.08 } }

// ─── Form fields ──────────────────────────────────────────────────────────────

/** Stagger container for form fields */
export const formContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

/** Each form field slides up */
export const formField: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: dur.slow, ease: ease.enter } },
}

/** Validation error message */
export const fieldError: Variants = {
  initial: { opacity: 0, y: -4, height: 0 },
  animate: { opacity: 1, y: 0,  height: "auto", transition: t.fast },
  exit:    { opacity: 0, y: -4, height: 0,      transition: t.fast },
}

// ─── Shimmer (skeleton loaders) ───────────────────────────────────────────────

export const shimmer: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: { repeat: Infinity, duration: 1.4, ease: "linear" },
  },
}

// ─── Collapse / accordion ─────────────────────────────────────────────────────

export const collapse: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: "auto", opacity: 1,
    transition: {
      height:   { duration: dur.slow,  ease: ease.standard },
      opacity:  { duration: dur.fast,  delay: 0.08 },
    },
  },
  exit: {
    height: 0, opacity: 0,
    transition: {
      height:  { duration: dur.slow,  ease: ease.standard },
      opacity: { duration: dur.fast },
    },
  },
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  animate: { opacity: 1, y: 0,   scale: 1,    transition: t.enter },
  exit:    { opacity: 0, scale: 0.96,          transition: t.fast  },
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getStaggerDelay(index: number, base = 0.05): number {
  return index * base
}

export function createTransition(duration: number, easing = ease.standard): Transition {
  return { duration, ease: easing as number[] }
}

export function createSpring(stiffness = 400, damping = 30): Transition {
  return { type: "spring", stiffness, damping }
}
