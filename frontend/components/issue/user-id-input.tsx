"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { User, Info } from "lucide-react"
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
          className={cn(
            "pl-12 pr-4 h-12 rounded-xl bg-card/50 backdrop-blur-sm",
            "border-border text-foreground placeholder:text-muted-foreground/50",
            "transition-all duration-200",
            "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50",
            error && "border-destructive/60 focus-visible:ring-destructive/20 focus-visible:border-destructive/60",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Self badge */}
        {isSelf && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
              You
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-destructive"
          role="alert"
        >
          {error}
        </motion.p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" />
          Defaults to your own ID. Change to issue to another member.
        </p>
      )}
    </div>
  )
}
