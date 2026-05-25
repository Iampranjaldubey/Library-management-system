"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { RoleBadge } from "@/components/auth/role-badge"
import { Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { staggerContainer, staggerItem, fadeInRight } from "@/lib/animations"

export function WelcomeSection() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const h = currentTime.getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  }

  if (!user) return null

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="relative flex-1 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card backdrop-blur-sm p-4 sm:p-6 md:p-8"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/6 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-primary/4 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Greeting */}
        <div className="space-y-1.5 min-w-0">
          <motion.h1
            variants={staggerItem}
            className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate"
          >
            {getGreeting()}, {user.name}! 👋
          </motion.h1>
          <motion.div
            variants={staggerItem}
            className="flex items-center gap-2 flex-wrap"
          >
            <p className="text-xs sm:text-sm text-muted-foreground">Welcome back to your dashboard</p>
            <RoleBadge role={user.role} size="sm" />
          </motion.div>
        </div>

        {/* Date & time — hidden on xs, compact on sm */}
        <motion.div
          variants={fadeInRight}
          className="hidden sm:flex flex-col gap-1.5 shrink-0"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">{format(currentTime, "EEE, MMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono font-medium tabular-nums">
              {format(currentTime, "HH:mm:ss")}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
