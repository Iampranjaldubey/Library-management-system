/**
 * Core API client for the LibraryOS backend.
 *
 * Design decisions:
 *  - Native fetch (no axios) — keeps the bundle small and avoids a dependency.
 *  - Token is read from localStorage on every call so it always reflects the
 *    latest value even if the AuthContext hasn't re-rendered yet.
 *  - All errors are thrown as ApiError instances so callers can branch on
 *    status codes without string-matching error messages.
 *  - Dev-mode logging prints method, URL, status, and the parsed body so
 *    failures are immediately visible in the browser console.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** Wrapper shape returned by every backend endpoint */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

/** Structured error thrown by apiFetch — always has a status code */
export class ApiError extends Error {
  status: number
  /** Raw response body (already parsed as JSON when available) */
  body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV === "development"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function clearSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  document.cookie = "auth-token=; path=/; max-age=0"
}

/** Log a request/response pair in development only */
function devLog(
  method: string,
  url: string,
  status: number,
  body: unknown,
  durationMs: number
) {
  if (!isDev) return
  const ok = status >= 200 && status < 300
  const style = ok ? "color: #22c55e" : "color: #ef4444"
  console.groupCollapsed(
    `%c[API] ${method} ${url} → ${status} (${durationMs}ms)`,
    style
  )
  console.log("Response body:", body)
  console.groupEnd()
}

/** Parse the backend error body and return a human-readable message */
async function parseErrorBody(res: Response): Promise<{ message: string; body: unknown }> {
  let body: unknown = null
  let message = `${res.status} ${res.statusText}`

  try {
    body = await res.json()
    if (body && typeof body === "object" && "message" in body) {
      const m = (body as { message: string }).message
      if (m) message = m
    }
  } catch {
    // Response body wasn't JSON — keep the default status message
  }

  return { message, body }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  const url = `${baseUrl}${endpoint}`
  const method = (options.method ?? "GET").toUpperCase()

  const token = getToken()

  // Warn in dev if a non-auth endpoint is called without a token
  if (isDev && !token && !endpoint.startsWith("/auth")) {
    console.warn(`[API] No token found for ${method} ${endpoint} — request will likely 401`)
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Spread any caller-supplied headers last so they can override
    ...(options.headers as Record<string, string> | undefined),
  }

  const t0 = Date.now()

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (networkErr: unknown) {
    const msg = networkErr instanceof Error ? networkErr.message : "Network error"
    if (isDev) {
      console.error(`[API] Network failure for ${method} ${url}:`, networkErr)
    }
    throw new ApiError(
      "Cannot reach the server. Make sure the backend is running on " + baseUrl,
      0,
      { originalMessage: msg }
    )
  }

  const duration = Date.now() - t0

  // ── Parse body (always attempt, even on error responses) ──────────────────
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // Empty body or non-JSON (e.g. 204 No Content)
  }

  devLog(method, url, response.status, body, duration)

  // ── Handle error responses ────────────────────────────────────────────────
  if (!response.ok) {
    // Extract the message from the parsed body (already done above)
    let message = `${response.status} ${response.statusText}`
    if (body && typeof body === "object" && "message" in body) {
      const m = (body as { message: string }).message
      if (m) message = m
    }

    if (isDev) {
      console.error(
        `[API] ${method} ${url} failed with ${response.status}:`,
        message,
        "\nFull response body:",
        body
      )
    }

    // 401 — token expired or invalid: clear session and redirect
    if (response.status === 401) {
      // Only clear session if we actually had a token (not a missing-token 401)
      if (typeof window !== "undefined") {
        const hadToken = !!localStorage.getItem("token")
        clearSession()
        if (hadToken) {
          // Hard redirect so the auth context re-initialises cleanly
          window.location.href = "/login"
        }
      }
      throw new ApiError("Session expired. Please sign in again.", 401, body)
    }

    // 403 — authenticated but not authorised for this action
    if (response.status === 403) {
      throw new ApiError(
        "You don't have permission to perform this action.",
        403,
        body
      )
    }

    throw new ApiError(message, response.status, body)
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return body as ApiResponse<T>
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Remove duplicate books, preferring the first occurrence.
 *  Deduplicates by `id` first, then falls back to `isbn`. */
export function dedupeBooks<T extends { id: string | number; isbn?: string }>(
  books: T[]
): T[] {
  const seenIds = new Set<string>()
  const seenIsbns = new Set<string>()
  return books.filter((book) => {
    const id = String(book.id)
    const isbn = book.isbn?.trim().toLowerCase()
    if (seenIds.has(id)) return false
    if (isbn && isbn !== "n/a" && seenIsbns.has(isbn)) return false
    seenIds.add(id)
    if (isbn && isbn !== "n/a") seenIsbns.add(isbn)
    return true
  })
}

// ─── Typed response shapes ────────────────────────────────────────────────────

export interface BookDto {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  available: boolean
}

export interface TransactionDto {
  id: number
  userId: number
  userName: string
  bookId: number
  bookTitle: string
  /** ISO date string "YYYY-MM-DD" (LocalDate, write-dates-as-timestamps=false) */
  issueDate: string
  /** ISO date string "YYYY-MM-DD" */
  dueDate: string
  /** ISO date string "YYYY-MM-DD" or null */
  returnDate: string | null
  fine: number | null
  /** Backend-computed status — use this instead of recomputing on the client */
  status: "ACTIVE" | "RETURNED" | "OVERDUE"
}

export interface AuthDto {
  token: string
  type: string
  id: number
  name: string
  email: string
  role: string
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    apiFetch<AuthDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),
}

// ─── Books API ────────────────────────────────────────────────────────────────

export const booksApi = {
  getAll: (available?: boolean) => {
    const query = available !== undefined ? `?available=${available}` : ""
    return apiFetch<BookDto[]>(`/books${query}`)
  },

  getById: (id: number) => apiFetch<BookDto>(`/books/${id}`),

  add: (book: { title: string; author: string; isbn: string; category: string }) =>
    apiFetch<BookDto>("/books", {
      method: "POST",
      body: JSON.stringify(book),
    }),

  update: (
    id: number,
    book: { title: string; author: string; isbn: string; category: string }
  ) =>
    apiFetch<BookDto>(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(book),
    }),

  delete: (id: number) =>
    apiFetch<void>(`/books/${id}`, { method: "DELETE" }),
}

// ─── Transactions API ─────────────────────────────────────────────────────────

export const transactionsApi = {
  issue: (bookId: number, userId: number) =>
    apiFetch<TransactionDto>("/issue", {
      method: "POST",
      body: JSON.stringify({ bookId, userId }),
    }),

  return: (transactionId: number) =>
    apiFetch<TransactionDto>("/return", {
      method: "POST",
      body: JSON.stringify({ transactionId }),
    }),

  getAll: () => apiFetch<TransactionDto[]>("/transactions"),

  getByUser: (userId: number) =>
    apiFetch<TransactionDto[]>(`/transactions/user/${userId}`),
}
