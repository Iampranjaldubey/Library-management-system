import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Next.js 16 proxy (previously "middleware").
 *
 * Strategy:
 *  - /login and /register are always public.
 *  - /dashboard/** requires an auth-token cookie.
 *    If absent, redirect to /login (preserving the intended destination).
 *
 * The auth-token cookie is written by AuthContext.login() alongside
 * localStorage so this proxy can gate server-side navigation.
 */

const PUBLIC_PATHS = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public auth routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Gate dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
}
