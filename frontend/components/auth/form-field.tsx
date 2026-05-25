"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FormFieldProps {
  id: string
  label: string
  error?: string
  /** Optional success message shown when field is valid and touched */
  success?: string
  /** Optional helper text shown below the input when no error */
  hint?: string
  /** Mark field as required — appends a red asterisk */
  required?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * Wraps a label + input + validation message into a consistent block.
 * Supports error, success, and hint states with animated transitions.
 */
export function FormField({
  id,
  label,
  error,
  success,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  const hasError = !!error
  const hasSuccess = !hasError && !!success

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row */}
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium transition-colors duration-150",
          hasError   ? "text-destructive"                        : "text-foreground/80",
          hasSuccess ? "text-emerald-600 dark:text-emerald-400"  : "",
        )}
      >
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
        )}
      </Label>

      {/* Input slot */}
      {children}

      {/* Validation message — animated */}
      <AnimatePresence mode="wait" initial={false}>
        {hasError ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs text-destructive overflow-hidden"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        ) : hasSuccess ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 overflow-hidden"
          >
            <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
            {success}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-muted-foreground/70"
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
