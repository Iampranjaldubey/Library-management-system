"use client"

import { cn } from "@/lib/utils"
import type { Role } from "@/lib/auth"
import { Shield, BookOpen, User } from "lucide-react"

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
    description: "Browse and borrow books",
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
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map(({ value: role, label, description, icon: Icon }) => {
          const isSelected = value === role
          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isSelected
                  ? "border-primary/60 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/8 hover:text-foreground"
              )}
              aria-pressed={isSelected}
            >
              <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground/60")} />
              <span className="text-xs font-semibold leading-none">{label}</span>
              <span className="text-[10px] leading-tight opacity-70 hidden sm:block">{description}</span>
            </button>
          )
        })}
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
