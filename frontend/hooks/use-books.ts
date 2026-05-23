"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { booksApi, dedupeBooks, ApiError, type BookDto } from "@/lib/api"
import { toast } from "sonner"

// ─── Public types ─────────────────────────────────────────────────────────────

export interface BookItem {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  available: boolean
}

export type SortField = "title" | "author" | "category" | "isbn"
export type SortDir = "asc" | "desc"

interface UseBooksOptions {
  pageSize?: number
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBooks({ pageSize = 10 }: UseBooksOptions = {}) {
  const [allBooks, setAllBooks] = useState<BookItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter / sort / pagination state
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "issued">("all")
  const [sortField, setSortField] = useState<SortField>("title")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [page, setPage] = useState(1)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await booksApi.getAll()
      const mapped: BookItem[] = Array.isArray(res.data)
        ? res.data.map((b: BookDto) => ({
            id: b.id,
            title: b.title || "Unknown",
            author: b.author || "Unknown",
            isbn: b.isbn || "N/A",
            category: b.category || "Uncategorized",
            available: b.available,
          }))
        : []
      setAllBooks(dedupeBooks(mapped))
      setPage(1) // reset to first page on fresh fetch
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return
      const msg = err instanceof ApiError ? err.message : String(err)
      setError(msg)
      toast.error("Failed to load books", { description: msg })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Derived data ───────────────────────────────────────────────────────────

  const categories = useMemo(
    () => [...new Set(allBooks.map((b) => b.category))].sort(),
    [allBooks]
  )

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allBooks
      .filter((b) => {
        if (q) {
          const hit =
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.category.toLowerCase().includes(q) ||
            b.isbn.toLowerCase().includes(q)
          if (!hit) return false
        }
        if (categoryFilter !== "all" && b.category !== categoryFilter) return false
        if (statusFilter === "available" && !b.available) return false
        if (statusFilter === "issued" && b.available) return false
        return true
      })
      .sort((a, b) => {
        const av = a[sortField].toLowerCase()
        const bv = b[sortField].toLowerCase()
        const cmp = av < bv ? -1 : av > bv ? 1 : 0
        return sortDir === "asc" ? cmp : -cmp
      })
  }, [allBooks, search, categoryFilter, statusFilter, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  )

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [search, categoryFilter, statusFilter])

  // ── Sort toggle helper ─────────────────────────────────────────────────────

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

  return {
    // data
    allBooks,
    paginated,
    filtered,
    categories,
    isLoading,
    error,
    // fetch
    fetchBooks,
    // filter state
    search, setSearch,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    // sort state
    sortField, sortDir, toggleSort,
    // pagination
    page, setPage,
    totalPages,
    pageSize,
  }
}
