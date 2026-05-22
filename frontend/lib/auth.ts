/**
 * Auth service — all authentication API calls live here.
 * Keeps the API layer clean and gives us a single place to
 * update if the backend contract changes.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "LIBRARIAN" | "USER"

export interface AuthUser {
  id: number
  name: string
  email: string
  role: Role
  token: string
  type: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: Role
}

/** Field-level validation errors returned by Spring's @Valid */
export type FieldErrors = Record<string, string>

export class AuthError extends Error {
  /** HTTP status code */
  status: number
  /** Field-level validation errors (only present on 400 validation failures) */
  fieldErrors?: FieldErrors

  constructor(message: string, status: number, fieldErrors?: FieldErrors) {
    super(message)
    this.name = "AuthError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function parseAuthError(res: Response): Promise<AuthError> {
  let message = `Request failed (${res.status})`
  let fieldErrors: FieldErrors | undefined

  try {
    const body = await res.json()
    // Backend wraps everything in ApiResponse<T>
    if (body?.message) message = body.message
    // Validation errors come back as data: { field: "message", ... }
    if (res.status === 400 && body?.data && typeof body.data === "object") {
      fieldErrors = body.data as FieldErrors
      message = "Please fix the errors below"
    }
  } catch {
    // response body wasn't JSON — keep default message
  }

  return new AuthError(message, res.status, fieldErrors)
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authService = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw await parseAuthError(res)

    const body = await res.json()
    if (!body?.data?.token) {
      throw new AuthError("No token received from server", 500)
    }
    return body.data as AuthUser
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw await parseAuthError(res)

    const body = await res.json()
    if (!body?.data?.token) {
      throw new AuthError("Registration succeeded but no token received", 500)
    }
    return body.data as AuthUser
  },
}
