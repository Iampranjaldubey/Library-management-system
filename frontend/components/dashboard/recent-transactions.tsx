"use client"

import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import { TransactionStatusBadge } from "@/components/transactions/transaction-status-badge"
import { InlineEmptyState } from "@/components/ui/empty-state"
import { BookOpen, User, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import type { TransactionDto } from "@/lib/api"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { ArrowLeftRight } from "lucide-react"

interface RecentTransactionsProps {
  transactions: TransactionDto[]
  isLoading: boolean
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Transactions</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Latest book issues and returns</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs sm:text-sm shrink-0">
          <Link href="/dashboard/transactions">
            <span className="hidden sm:inline">View all</span>
            <span className="sm:hidden">All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <TransactionSkeleton key={i} index={i} />
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <AnimatePresence>
              {recentTransactions.map((tx, index) => (
                <TransactionItem key={tx.id} transaction={tx} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function TransactionItem({ transaction, index }: { transaction: TransactionDto; index: number }) {
  const isOverdue = transaction.status === "OVERDUE"

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ x: 2, transition: { duration: 0.15 } }}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 sm:p-4",
        "transition-colors duration-150",
        isOverdue
          ? "border-destructive/20 bg-destructive/5 hover:border-destructive/30"
          : "border-border bg-card hover:border-primary/30 hover:bg-muted/20"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg",
        isOverdue ? "bg-destructive/10" : "bg-primary/10"
      )}>
        <BookOpen className={cn("h-4 w-4 sm:h-5 sm:w-5", isOverdue ? "text-destructive" : "text-primary")} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{transaction.bookTitle}</p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{transaction.userName}</span>
            </div>
          </div>
          <TransactionStatusBadge status={transaction.status} size="sm" />
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{format(parseISO(transaction.issueDate), "MMM d")}</span>
          </div>
          <span className="text-muted-foreground/30">·</span>
          <span className={cn(isOverdue && "text-destructive font-medium")}>
            Due {format(parseISO(transaction.dueDate), "MMM d")}
          </span>
          {transaction.returnDate && (
            <span className="text-emerald-600 dark:text-emerald-400">
              · Returned {format(parseISO(transaction.returnDate), "MMM d")}
            </span>
          )}
        </div>

        {transaction.fine && transaction.fine > 0 && (
          <div className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">
            Fine: ₹{transaction.fine.toFixed(2)}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <InlineEmptyState
      icon={ArrowLeftRight}
      title="No transactions yet"
      description="Transactions will appear here once books are issued to members"
    />
  )
}

function TransactionSkeleton({ index = 0 }: { index?: number }) {
  return (
    <div
      className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}
