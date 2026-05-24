"use client"

import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Calendar, Clock, Tag, Hash } from "lucide-react"
import type { AvailableBook } from "@/hooks/use-issue-form"

interface IssueSummaryCardProps {
  book: AvailableBook | null
  issueDate: string
  dueDate: string
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span className="text-xs font-medium text-foreground text-right truncate">{value}</span>
      </div>
    </div>
  )
}

export function IssueSummaryCard({ book, issueDate, dueDate }: IssueSummaryCardProps) {
  return (
    <AnimatePresence mode="wait">
      {book ? (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            {/* Book header */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
                  {book.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-primary/10" />

            {/* Details */}
            <div className="space-y-2">
              <DetailRow icon={Tag} label="Category" value={book.category} />
              <DetailRow icon={Hash} label="ISBN" value={book.isbn} />
              <DetailRow icon={Calendar} label="Issue date" value={issueDate} />
              <DetailRow icon={Clock} label="Due date" value={dueDate} />
            </div>

            {/* Due date callout */}
            <div className="rounded-lg bg-primary/10 border border-primary/15 px-3 py-2">
              <p className="text-xs text-primary font-medium">
                📅 Return by <span className="font-bold">{dueDate}</span>
              </p>
              <p className="text-[11px] text-primary/70 mt-0.5">
                Late returns incur a fine of ₹5 per day
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 flex flex-col items-center gap-2 text-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <BookOpen className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a book to see issue details
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
