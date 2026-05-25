"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import type { Role } from "@/lib/auth"

interface Options {
  /** If provided, redirect unless the user has one of these roles */
  allowedRoles?: Role[]
  /** Where to redirect on auth failure (default: "/login") */
  redirectTo?: string
}

/**
 * Redirects unauthenticated (or unauthorised) users away from a page.
 *
 * Usage:
 *   const { isLoading } = useProtectedRoute()
 *   const { isLoading } = useProtectedRoute({ allowedRoles: ["ADMIN", "LIBRARIAN"] })
 */
export function useProtectedRoute(options: Options = {}) {
  const { allowedRoles, redirectTo = "/login" } = options
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.replace(redirectTo)
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role as Role)) {
      // Authenticated but wrong role — send to unauthorized page
      router.replace("/unauthorized")
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router])

  return { isLoading, isAuthenticated, user }
}
