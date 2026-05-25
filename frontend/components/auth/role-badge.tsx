"use client"

import { cn } from "@/lib/utils"
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/permissions"
import type { Role } from "@/lib/auth"
import { Shield, ShieldCheck, User } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleBadgeProps {
  role: Role
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Show icon */
  showIcon?: boolean
  /** Custom className */
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Display a role badge with color coding and optional icon.
 * 
 * @example
 * <RoleBadge role="ADMIN" />
 * <RoleBadge role="LIBRARIAN" size="sm" showIcon />
 * <RoleBadge role="USER" size="lg" />
 */
export function RoleBadge({ role, size = "md", showIcon = false, className }: RoleBadgeProps) {
  const colors = getRoleBadgeColor(role)
  const displayName = getRoleDisplayName(role)

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  }

  const Icon = role === "ADMIN" ? ShieldCheck : role === "LIBRARIAN" ? Shield : User

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold uppercase tracking-wider transition-colors",
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={cn("shrink-0", iconSizes[size])} />}
      {displayName}
    </span>
  )
}

// ─── Convenience Components ───────────────────────────────────────────────────

/**
 * Display current user's role badge
 */
export function CurrentUserRoleBadge({ size, showIcon, className }: Omit<RoleBadgeProps, "role">) {
  const { useAuth } = require("@/context/auth-context")
  const { user } = useAuth()

  if (!user?.role) return null

  return <RoleBadge role={user.role} size={size} showIcon={showIcon} className={className} />
}
