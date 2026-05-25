"use client"

import { useAuth } from "@/context/auth-context"
import { hasPermission, hasAnyPermission, type Permission } from "@/lib/permissions"
import type { Role } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProtectedComponentProps {
  children: React.ReactNode
  /** Required permission(s) - if array, user needs ANY of them */
  permission?: Permission | Permission[]
  /** Required role(s) - if array, user needs ANY of them */
  roles?: Role | Role[]
  /** Fallback content when user doesn't have permission */
  fallback?: React.ReactNode
  /** Invert the logic - show when user DOESN'T have permission */
  invert?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Conditionally render children based on user permissions or roles.
 * 
 * @example
 * // Show only to users with permission
 * <ProtectedComponent permission="books:create">
 *   <Button>Add Book</Button>
 * </ProtectedComponent>
 * 
 * @example
 * // Show only to specific roles
 * <ProtectedComponent roles={["ADMIN", "LIBRARIAN"]}>
 *   <Button>Manage Books</Button>
 * </ProtectedComponent>
 * 
 * @example
 * // Show with fallback
 * <ProtectedComponent permission="books:edit" fallback={<p>No access</p>}>
 *   <Button>Edit Book</Button>
 * </ProtectedComponent>
 * 
 * @example
 * // Invert logic - show when user DOESN'T have permission
 * <ProtectedComponent permission="books:create" invert>
 *   <p>You cannot create books</p>
 * </ProtectedComponent>
 */
export function ProtectedComponent({
  children,
  permission,
  roles,
  fallback = null,
  invert = false,
}: ProtectedComponentProps) {
  const { user } = useAuth()

  // Check permission-based access
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission]
    const hasAccess = hasAnyPermission(user?.role, permissions)
    const shouldShow = invert ? !hasAccess : hasAccess
    return shouldShow ? <>{children}</> : <>{fallback}</>
  }

  // Check role-based access
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    const hasAccess = user?.role && allowedRoles.includes(user.role)
    const shouldShow = invert ? !hasAccess : hasAccess
    return shouldShow ? <>{children}</> : <>{fallback}</>
  }

  // No restrictions - show children
  return <>{children}</>
}

// ─── Convenience Components ───────────────────────────────────────────────────

/**
 * Show content only to ADMIN users
 */
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent roles="ADMIN" fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

/**
 * Show content only to ADMIN and LIBRARIAN users
 */
export function StaffOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent roles={["ADMIN", "LIBRARIAN"]} fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

/**
 * Show content only to USER role
 */
export function MemberOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent roles="USER" fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

/**
 * Show content only to users who can manage books
 */
export function CanManageBooks({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent permission={["books:create", "books:edit", "books:delete"]} fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

/**
 * Show content only to users who can view all transactions
 */
export function CanViewAllTransactions({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent permission="transactions:view-all" fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}
