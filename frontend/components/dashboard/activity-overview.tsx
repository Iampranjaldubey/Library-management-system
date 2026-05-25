"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Activity, TrendingUp, Users, BookMarked } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { staggerContainer, staggerItem, cardHover } from "@/lib/animations"

interface ActivityOverviewProps {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  totalTransactions: number
  isLoading: boolean
}

interface ActivityItemProps {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bgColor: string
}

export function ActivityOverview({
  totalBooks,
  availableBooks,
  issuedBooks,
  totalTransactions,
  isLoading,
}: ActivityOverviewProps) {
  const availabilityRate =
    totalBooks > 0 ? ((availableBooks / totalBooks) * 100).toFixed(1) : "0"
  const utilizationRate =
    totalBooks > 0 ? ((issuedBooks / totalBooks) * 100).toFixed(1) : "0"

  const activities: ActivityItemProps[] = [
    {
      label: "Availability Rate",
      value: `${availabilityRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Utilization Rate",
      value: `${utilizationRate}%`,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Catalogue",
      value: totalBooks.toString(),
      icon: BookMarked,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "All Transactions",
      value: totalTransactions.toString(),
      icon: Users,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Activity Overview</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Key metrics and insights</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ActivitySkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            {activities.map((activity) => (
              <ActivityItem key={activity.label} {...activity} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ActivityItem({ label, value, icon: Icon, color, bgColor }: ActivityItemProps) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={cardHover}
      className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border bg-card p-3 sm:p-4 cursor-default"
    >
      <div className={cn("flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg", bgColor)}>
        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-foreground tabular-nums mt-0.5">{value}</p>
      </div>
    </motion.div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5 sm:space-y-2">
        <Skeleton className="h-2.5 sm:h-3 w-16 sm:w-24" />
        <Skeleton className="h-5 sm:h-6 w-12 sm:w-16" />
      </div>
    </div>
  )
}
