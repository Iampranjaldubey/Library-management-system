/**
 * Centralized permission system for role-based access control.
 * 
 * This module provides utilities to check permissions across the application
 * without hardcoding role checks everywhere.
 */

import type { Role } from "@/lib/auth"

// ─── Permission Types ─────────────────────────────────────────────────────────

export type Permission =
  // Book management
  | "books:view"
  | "books:create"
  | "books:edit"
  | "books:delete"
  // Transaction management
  | "transactions:view-all"
  | "transactions:view-own"
  | "transactions:issue"
  | "transactions:return"
  // Dashboard
  | "dashboard:view-stats"
  | "dashboard:view-all-stats"

// ─── Role Permission Matrix ───────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Full access to everything
    "books:view",
    "books:create",
    "books:edit",
    "books:delete",
    "transactions:view-all",
    "transactions:view-own",
    "transactions:issue",
    "transactions:return",
    "dashboard:view-stats",
    "dashboard:view-all-stats",
  ],
  LIBRARIAN: [
    // Can manage books and transactions
    "books:view",
    "books:create",
    "books:edit",
    "books:delete",
    "transactions:view-all",
    "transactions:view-own",
    "transactions:issue",
    "transactions:return",
    "dashboard:view-stats",
    "dashboard:view-all-stats",
  ],
  USER: [
    // Can only view books and own transactions
    "books:view",
    "transactions:view-own",
    "dashboard:view-stats",
  ],
}

// ─── Permission Utilities ─────────────────────────────────────────────────────

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role has ANY of the specified permissions
 */
export function hasAnyPermission(
  role: Role | undefined | null,
  permissions: Permission[]
): boolean {
  if (!role) return false
  return permissions.some((p) => hasPermission(role, p))
}

/**
 * Check if a role has ALL of the specified permissions
 */
export function hasAllPermissions(
  role: Role | undefined | null,
  permissions: Permission[]
): boolean {
  if (!role) return false
  return permissions.every((p) => hasPermission(role, p))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

// ─── Role Utilities ───────────────────────────────────────────────────────────

/**
 * Check if a role can manage books (create, edit, delete)
 */
export function canManageBooks(role: Role | undefined | null): boolean {
  return hasAllPermissions(role, ["books:create", "books:edit", "books:delete"])
}

/**
 * Check if a role can view all transactions
 */
export function canViewAllTransactions(role: Role | undefined | null): boolean {
  return hasPermission(role, "transactions:view-all")
}

/**
 * Check if a role can issue/return books
 */
export function canManageTransactions(role: Role | undefined | null): boolean {
  return hasAllPermissions(role, ["transactions:issue", "transactions:return"])
}

/**
 * Check if a role can view dashboard statistics
 */
export function canViewDashboardStats(role: Role | undefined | null): boolean {
  return hasPermission(role, "dashboard:view-stats")
}

/**
 * Check if a role can view all dashboard statistics (including transactions)
 */
export function canViewAllDashboardStats(role: Role | undefined | null): boolean {
  return hasPermission(role, "dashboard:view-all-stats")
}

// ─── Role Display Utilities ───────────────────────────────────────────────────

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: Role): string {
  const names: Record<Role, string> = {
    ADMIN: "Administrator",
    LIBRARIAN: "Librarian",
    USER: "Member",
  }
  return names[role]
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: Role): {
  bg: string
  text: string
  border: string
} {
  const colors: Record<Role, { bg: string; text: string; border: string }> = {
    ADMIN: {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500/20",
    },
    LIBRARIAN: {
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/20",
    },
    USER: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/20",
    },
  }
  return colors[role]
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    ADMIN: "Full system access with all permissions",
    LIBRARIAN: "Manage books, issue and return books, view all transactions",
    USER: "Browse books and view personal transactions",
  }
  return descriptions[role]
}

// ─── Route Protection Utilities ───────────────────────────────────────────────

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: Role | undefined | null, path: string): boolean {
  if (!role) return false

  // Public routes (accessible to all authenticated users)
  const publicRoutes = ["/dashboard", "/dashboard/books"]
  if (publicRoutes.includes(path)) return true

  // Protected routes
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard/issue": ["transactions:issue"],
    "/dashboard/return": ["transactions:return"],
    "/dashboard/transactions": ["transactions:view-all"],
  }

  const requiredPermissions = routePermissions[path]
  if (!requiredPermissions) return true // Unknown route, allow by default

  return hasAllPermissions(role, requiredPermissions)
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutes(role: Role): string[] {
  const allRoutes = [
    "/dashboard",
    "/dashboard/books",
    "/dashboard/issue",
    "/dashboard/return",
    "/dashboard/transactions",
  ]

  return allRoutes.filter((route) => canAccessRoute(role, route))
}
