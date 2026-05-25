"use client"

import { motion } from "framer-motion"
import { CheckCircle2, BookOpen, User, Calendar, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { scaleIn, staggerContainer, staggerItem, fadeInUp } from "@/lib/animations"
import type { IssuedResult } from "@/hooks/use-issue-form"

interface IssueSuccessStateProps {
  result: IssuedResult
  onIssueAnother: () => void
}

const DETAILS = (result: IssuedResult) => [
  { icon: BookOpen, label: "Book",       value: result.bookTitle },
  { icon: User,     label: "Issued to",  value: result.userName  },
  { icon: Calendar, label: "Issue date", value: result.issueDate },
  { icon: Clock,    label: "Due date",   value: result.dueDate   },
]

export function IssueSuccessState({ result, onIssueAnother }: IssueSuccessStateProps) {
  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent p-8 text-center space-y-6"
    >
      {/* Check icon — spring pop */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 14 }}
        className="flex justify-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 shadow-lg shadow-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
      </motion.div>

      {/* Heading */}
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="space-y-1"
      >
        <h3 className="text-xl font-bold text-foreground">Book Issued Successfully</h3>
        <p className="text-sm text-muted-foreground">The transaction has been recorded</p>
      </motion.div>

      {/* Details card — staggered rows */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 text-left space-y-3"
      >
        {DETAILS(result).map(({ icon: Icon, label, value }) => (
          <motion.div key={label} variants={staggerItem} className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-semibold text-foreground text-right">{value}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Due date reminder */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-2.5"
      >
        <p className="text-sm text-primary font-medium">
          Return by <span className="font-bold">{result.dueDate}</span>
        </p>
        <p className="text-xs text-primary/70 mt-0.5">Late returns incur a fine of ₹5 per day</p>
      </motion.div>

      {/* Action */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.52 }}
      >
        <Button
          onClick={onIssueAnother}
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-muted/50"
        >
          <RotateCcw className="h-4 w-4" />
          Issue another book
        </Button>
      </motion.div>
    </motion.div>
  )
}
