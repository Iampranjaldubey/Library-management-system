"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { User, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserIdInputProps {
  value: string
  onChange: (v: string) => void
  error?: string
  disabled?: boolean
  /** If true, shows a subtle "your own ID" hint */
  isSelf?: boolean
}

export function UserIdInput({ value, onChange, error, disabled, isSelf }: UserIdInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        {/* Left icon */}
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <Input
          id="userId"
          type="number"
          min={1}
          placeholder="Enter member user ID"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "pl-12 h-12 rounded-xl bg-card/50 backdrop-blur-sm",
            "placeholder:text-muted-foreground/40",
            "transition-all duration-150",
            error && "border-destructive/60 focus-visible:ring-destructive/15",
            disabled && "opacity-50 cursor-not-allowed",
            // Hide number spinners
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            isSelf && !error && "pr-14"
          )}
        />

        {/* Self badge */}
        <AnimatePresence>
          {isSelf && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                You
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation / hint */}
      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs text-destructive overflow-hidden"
            role="alert"
          >
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/60"
          >
            <Info className="h-3 w-3 shrink-0" aria-hidden="true" />
            Defaults to your own ID. Change to issue to another member.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
