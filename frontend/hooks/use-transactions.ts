"use client"

import { useState, useCallback, useMemo } from "react"
import { ApiError } from "@/lib/api"
import { transactionService, type TransactionRow } from "@/lib/transaction-service"
import { toast } from "sonner"

// ─── Filter / sort types ──────────────────────────────────────────────────────

export type StatusFilter = "all" | "ACTIVE" | "RETURNED" | "OVERDUE"
export type SortField = "id" | "bookTitle" | "userName" | "issueDate" | "dueDate" | "status"
export type SortDir = "asc" | "desc"

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTransactions() {
  const [allTransactions, setAllTransactions] = useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // ── Filter / sort state ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // ── Fetch all transactions (GET /transactions) ─────────────────────────────

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const rows = await transactionService.getAll()
      setAllTransactions(rows)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 0
            ? "Cannot reach the server. Make sure the backend is running."
            : err.message
          : String(err)
      setFetchError(msg)
      toast.error("Failed to load transactions", { description: msg })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Derived: filtered + sorted list ───────────────────────────────────────

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return allTransactions
      .filter((tx) => {
        // Text search across book title and member name
        if (q) {
          const hit =
            tx.bookTitle.toLowerCase().includes(q) ||
            tx.userName.toLowerCase().includes(q)
          if (!hit) return false
        }
        // Status filter
        if (statusFilter !== "all" && tx.status !== statusFilter) return false
        return true
      })
      .sort((a, b) => {
        let av: string | number = a[sortField] ?? ""
        let bv: string | number = b[sortField] ?? ""

        // Numeric sort for id
        if (sortField === "id") {
          return sortDir === "asc"
            ? (av as number) - (bv as number)
            : (bv as number) - (av as number)
        }

        // String sort for everything else
        av = String(av).toLowerCase()
        bv = String(bv).toLowerCase()
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === "asc" ? cmp : -cmp
      })
  }, [allTransactions, searchQuery, statusFilter, sortField, sortDir])

  // ── Sort toggle ────────────────────────────────────────────────────────────

  const toggleSort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
        return field
      }
      setSortDir("asc")
      return field
    })
  }, [])

  // ── Derived counts for summary bar ────────────────────────────────────────

  const counts = useMemo(
    () => ({
      total: allTransactions.length,
      active: allTransactions.filter((t) => t.status === "ACTIVE").length,
      overdue: allTransactions.filter((t) => t.status === "OVERDUE").length,
      returned: allTransactions.filter((t) => t.status === "RETURNED").length,
    }),
    [allTransactions]
  )

  return {
    // data
    allTransactions,
    filtered,
    isLoading,
    fetchError,
    counts,
    // filter state
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    // sort state
    sortField,
    sortDir,
    toggleSort,
    // actions
    fetchTransactions,
  }
}
