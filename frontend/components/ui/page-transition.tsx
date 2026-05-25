"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { pageVariants } from "@/lib/animations"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

/**
 * Wraps page content with a subtle fade+slide transition on every route change.
 * Uses `mode="wait"` so the outgoing page fully exits before the new one enters.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
