/**
 * Return service — all return-related API calls and data transformations.
 *
 * Single responsibility: talk to POST /return and map the backend
 * TransactionResponse into the shape the UI needs.
 * All callers receive typed errors they can branch on without string-matching.
 */

import { apiFetch, ApiError, type TransactionDto } from "@/lib/api"
import { format, parseISO } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape handed back to the UI after a successful return */
export interface ReturnedResult {
  transactionId: number
  bookTitle: string
  userName: string
  /** Human-readable return date, e.g. "May 24, 2026" */
  returnDate: string
  /** Authoritative fine from the backend (0 when on-time) */
  fine: number
  /** True when the backend applied a late-return fine */
  wasOverdue: boolean
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const returnService = {
  /**
   * POST /return  { transactionId }
   *
   * Throws ApiError on any failure so callers can branch on .status:
   *   400 — book already returned
   *   404 — transaction not found
   *   401 — session expired (apiFetch auto-redirects)
   *   403 — insufficient role
   *   0   — backend offline
   */
  async processReturn(transactionId: number): Promise<ReturnedResult> {
    const res = await apiFetch<TransactionDto>("/return", {
      method: "POST",
      body: JSON.stringify({ transactionId }),
    })

    // apiFetch only resolves on 2xx — if we reach here the call succeeded
    const tx = res.data

    return {
      transactionId: tx.id,
      bookTitle: tx.bookTitle,
      userName: tx.userName,
      // returnDate is always set by the backend on a successful return
      returnDate: tx.returnDate
        ? format(parseISO(tx.returnDate), "PPP")
        : format(new Date(), "PPP"),
      fine: tx.fine ?? 0,
      wasOverdue: (tx.fine ?? 0) > 0,
    }
  },
}

/**
 * Derive a human-readable error message from an ApiError thrown by
 * returnService.processReturn().  Keeps error-handling logic out of the hook.
 */
export function getReturnErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "An unexpected error occurred. Please try again."

  // Backend message is already user-friendly for these cases
  if (err.status === 400 || err.status === 404) {
    const backendMsg = extractBackendMessage(err)
    if (backendMsg) return backendMsg
  }

  if (err.status === 0) {
    return "Cannot reach the server. Make sure the backend is running."
  }

  if (err.status === 403) {
    return "You don't have permission to process returns."
  }

  // Generic fallback — use the backend message when available
  return extractBackendMessage(err) ?? err.message
}

function extractBackendMessage(err: ApiError): string | null {
  if (
    err.body &&
    typeof err.body === "object" &&
    "message" in err.body &&
    typeof (err.body as { message: unknown }).message === "string"
  ) {
    return (err.body as { message: string }).message
  }
  return null
}
