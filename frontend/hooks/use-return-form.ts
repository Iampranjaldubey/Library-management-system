"use client"

import { useState, useCallback } from "react"
import { transactionsApi, ApiError, type TransactionDto } from "@/lib/api"
import { returnService, getReturnErrorMessage, type ReturnedResult } from "@/lib/return-service"
import { toast } from "sonner"
import { differenceInCalendarDays, parseISO } from "date-fns"

// ─── Types ────────────────────────────────────────────────────────────────────

export type { ReturnedResult }

export interface ActiveTransaction {
  id: number
  bookTitle: string
  userName: string
  /** ISO date string "YYYY-MM-DD" */
  issueDate: string
  /** ISO date string "YYYY-MM-DD" */
  dueDate: string
  status: "ACTIVE" | "OVERDUE"
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReturnForm() {
  // Start false — page guards against calling fetchActiveTransactions until
  // auth resolves, so we don't want a loading spinner before we even try.
  const [activeTransactions, setActiveTransactions] = useState<ActiveTransaction[]>([])
  const [isTxLoading, setIsTxLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [selectedTransactionId, setSelectedTransactionId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [returnedResult, setReturnedResult] = useState<ReturnedResult | null>(null)

  // ── Fetch active / overdue transactions from GET /transactions ─────────────

  const fetchActiveTransactions = useCallback(async () => {
    setIsTxLoading(true)
    setFetchError(null)
    try {
      const res = await transactionsApi.getAll()

      if (res.success && Array.isArray(res.data)) {
        // Only show ACTIVE and OVERDUE — RETURNED transactions are irrelevant here
        const active: ActiveTransaction[] = res.data
          .filter((t: TransactionDto) => t.status === "ACTIVE" || t.status === "OVERDUE")
          .map((t: TransactionDto) => ({
            id: t.id,
            bookTitle: t.bookTitle,
            userName: t.userName,
            issueDate: t.issueDate,
            dueDate: t.dueDate,
            status: t.status as "ACTIVE" | "OVERDUE",
          }))
        setActiveTransactions(active)
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 0
            ? "Cannot reach the server. Make sure the backend is running."
            : err.message
          : String(err)
      setFetchError(msg)
      toast.error("Failed to load issued books", { description: msg })
    } finally {
      setIsTxLoading(false)
    }
  }, [])

  // ── Submit POST /return ────────────────────────────────────────────────────

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTransactionId) {
      toast.error("Please select a book to return")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await returnService.processReturn(Number(selectedTransactionId))
      setReturnedResult(result)

      if (result.wasOverdue) {
        toast.warning("Book returned with fine", {
          description: `Late return fine: ₹${result.fine.toFixed(2)}`,
        })
      } else {
        toast.success("Book returned successfully", {
          description: `"${result.bookTitle}" has been checked in.`,
        })
      }

      // Clear selection and refresh the list so the returned book disappears
      setSelectedTransactionId("")
      fetchActiveTransactions()
    } catch (err) {
      const msg = getReturnErrorMessage(err)

      if (err instanceof ApiError && err.status === 400) {
        // Already-returned — surface as a specific message, not a generic error
        toast.error("Cannot process return", { description: msg })
      } else if (err instanceof ApiError && err.status === 404) {
        toast.error("Transaction not found", {
          description: "This transaction may have already been processed. Refreshing the list.",
        })
        fetchActiveTransactions()
      } else {
        toast.error("Failed to process return", { description: msg })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setSelectedTransactionId("")
    setReturnedResult(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedTransaction =
    activeTransactions.find((t) => String(t.id) === selectedTransactionId) ?? null

  /**
   * Client-side fine preview shown before the user submits.
   * The backend is the authoritative source — this is display-only.
   * Rate: ₹5 per overdue calendar day (matches TransactionServiceImpl).
   */
  const previewFine = (dueDate: string): number => {
    const days = differenceInCalendarDays(new Date(), parseISO(dueDate))
    return days > 0 ? days * 5 : 0
  }

  return {
    // data
    activeTransactions,
    isTxLoading,
    fetchError,
    // form state
    selectedTransactionId,
    setSelectedTransactionId,
    isSubmitting,
    returnedResult,
    // derived
    selectedTransaction,
    previewFine,
    // actions
    fetchActiveTransactions,
    onSubmit,
    resetForm,
  }
}
