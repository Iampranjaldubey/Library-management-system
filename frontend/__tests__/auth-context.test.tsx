import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type { ReactNode } from "react"

// Next's router isn't available in jsdom; capture navigation calls instead.
const push = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

// logout() calls the backend to clear the HttpOnly cookie; stub it so the test
// doesn't hit the network (jsdom has no fetch).
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>()
  return {
    ...actual,
    authService: { ...actual.authService, logout: vi.fn().mockResolvedValue(undefined) },
  }
})

import { AuthProvider, useAuth } from "@/context/auth-context"
import type { AuthUser } from "@/lib/auth"

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

const sampleUser: AuthUser = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  role: "ADMIN",
  token: "jwt-access-token",
  refreshToken: "the-refresh-token",
  type: "Bearer",
}

beforeEach(() => {
  localStorage.clear()
  document.cookie = "auth-token=; path=/; max-age=0"
  push.mockClear()
})

describe("AuthProvider", () => {
  it("persists the user and exposes role flags on login", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.login(sampleUser))

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.isUser).toBe(false)
    expect(localStorage.getItem("token")).toBe("jwt-access-token")
    expect(localStorage.getItem("user")).toContain("ada@example.com")
    expect(document.cookie).toContain("auth-token=jwt-access-token")
  })

  it("clears the session and redirects to /login on logout", () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => result.current.login(sampleUser))
    act(() => result.current.logout())

    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem("token")).toBeNull()
    expect(localStorage.getItem("user")).toBeNull()
    expect(push).toHaveBeenCalledWith("/login")
  })
})
