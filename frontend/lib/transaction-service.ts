/**
 * Transaction service — all transaction-related API calls.
 *
 * Wraps transactionsApi from api.ts and maps raw TransactionDto arrays
 * into the TransactionRow shape the UI consumes.
 * Callers receive typed ApiError instances — no string-matching needed.
 */

import { transactionsApi, type TransactionDto } from "@/lib/api"

// ─── UI types ─────────────────────────────────────────────────────────────────

/** The normalised shape every UI component works with */
export interface TransactionRow {
  id: number
  bookId: number
  bookTitle: string
  userId: number
  userName: string
  /** ISO date string "YYYY-MM-DD" */
  issueDate: string
  /** ISO date string "YYYY-MM-DD" */
  dueDate: string
  /** ISO date string "YYYY-MM-DD" or null when not yet returned */
  returnDate: string | null
  /** Fine in ₹ — 0 when on-time or not yet returned */
  fine: number
  status: "ACTIVE" | "RETURNED" | "OVERDUE"
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function toRow(dto: TransactionDto): TransactionRow {
  return {
    id: dto.id,
    bookId: dto.bookId,
    bookTitle: dto.bookTitle,
    userId: dto.userId,
    userName: dto.userName,
    issueDate: dto.issueDate,
    dueDate: dto.dueDate,
    returnDate: dto.returnDate,
    fine: dto.fine ?? 0,
    status: dto.status,
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const transactionService = {
  /**
   * GET /transactions
   * Returns all transactions. Requires ADMIN or LIBRARIAN role.
   * Throws ApiError on failure.
   */
  async getAll(): Promise<TransactionRow[]> {
    const res = await transactionsApi.getAll()
    return Array.isArray(res.data) ? res.data.map(toRow) : []
  },

  /**
   * GET /transactions/user/{userId}
   * Returns transactions for a specific user. Requires ADMIN or LIBRARIAN role.
   * Throws ApiError on failure.
   */
  async getByUser(userId: number): Promise<TransactionRow[]> {
    const res = await transactionsApi.getByUser(userId)
    return Array.isArray(res.data) ? res.data.map(toRow) : []
  },
}
