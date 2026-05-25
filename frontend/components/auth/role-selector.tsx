"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/auth"
import { Shield, BookOpen, User, AlertCircle, CheckCircle2 } from "lucide-react"

interface RoleOption {
  value: Role
  label: string
  description: string
  icon: React.ElementType
}

const ROLES: RoleOption[] = [
  {
    value: "USER",
    label: "Member",
    description: "Browse & borrow books",
    icon: User,
  },
  {
    value: "LIBRARIAN",
    label: "Librarian",
    description: "Manage books & transactions",
    icon: BookOpen,
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Full system access",
    icon: Shield,
  },
]

interface RoleSelectorProps {
  value: Role
  onChange: (role: Role) => void
  error?: string
}

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account type">
        {ROLES.map(({ value: role, label, description, icon: Icon }) => {
          const isSelected = value === role
          return (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(role)}
              className={cn(
                // Base
                "relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center",
                "transition-all duration-150",
                // Focus
                "focus:outline-none focus-visible:ring-3 focus-visible:ring-primary/30",
                // Active press
                "active:scale-[0.97]",
                // States
                isSelected
                  ? [
                      "border-primary/50 bg-primary/10 shadow-sm shadow-primary/10",
                      "ring-1 ring-primary/20",
                    ].join(" ")
                  : [
                      "border-white/10 bg-white/5 text-muted-foreground",
                      "hover:border-white/20 hover:bg-white/8 hover:text-foreground",
                    ].join(" ")
              )}
            >
              {/* Selected indicator dot */}
              {isSelected && (
                <motion.span
                  layoutId="role-indicator"
                  className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "h-5 w-5 transition-colors duration-150",
                  isSelected ? "text-primary" : "text-muted-foreground/50"
                )}
              />
              <div>
                <span className={cn(
                  "block text-xs font-semibold leading-none",
                  isSelected ? "text-primary" : "text-foreground/80"
                )}>
                  {label}
                </span>
                <span className="mt-1 block text-[10px] leading-tight text-muted-foreground/60 hidden sm:block">
                  {description}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Error / success message */}
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
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        ) : value ? (
          <motion.p
            key="selected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {ROLES.find(r => r.value === value)?.label} selected
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
