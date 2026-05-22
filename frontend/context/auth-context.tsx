"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react"
import { useRouter } from "next/navigation"
import type { AuthUser, Role } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null
  /** True while the initial localStorage hydration is in progress */
  isLoading: boolean
  isAuthenticated: boolean
  /** Role helpers */
  isAdmin: boolean
  isLibrarian: boolean
  isUser: boolean
  hasRole: (role: Role) => boolean
  /** Persist a successful login */
  login: (user: AuthUser) => void
  /** Clear session and redirect to /login */
  logout: () => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem("token")
      const stored = localStorage.getItem("user")
      if (token && stored) {
        const parsed = JSON.parse(stored) as AuthUser
        // Basic sanity check — make sure the stored object has the fields we need
        if (parsed?.id && parsed?.token && parsed?.role) {
          setUser(parsed)
          // Re-sync the middleware cookie in case it expired (e.g. browser restart)
          document.cookie = `auth-token=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`
        } else {
          throw new Error("Malformed stored user")
        }
      }
    } catch {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      document.cookie = "auth-token=; path=/; max-age=0"
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((userData: AuthUser) => {
    localStorage.setItem("token", userData.token)
    localStorage.setItem("user", JSON.stringify(userData))
    // Write a cookie so the middleware can gate server-side navigation.
    // SameSite=Lax is safe here; HttpOnly=false so JS can clear it on logout.
    document.cookie = `auth-token=${userData.token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Expire the middleware cookie
    document.cookie = "auth-token=; path=/; max-age=0"
    setUser(null)
    router.push("/login")
  }, [router])

  const hasRole = useCallback(
    (role: Role) => user?.role === role,
    [user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      isLibrarian: user?.role === "LIBRARIAN",
      isUser: user?.role === "USER",
      hasRole,
      login,
      logout,
    }),
    [user, isLoading, hasRole, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}
