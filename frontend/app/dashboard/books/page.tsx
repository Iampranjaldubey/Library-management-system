"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { canManageBooks } from "@/lib/permissions"
import { useBooks } from "@/hooks/use-books"
import { booksApi, ApiError } from "@/lib/api"
import type { BookItem } from "@/hooks/use-books"
import type { BookFormValues } from "@/components/books/book-form-modal"

import { PageHeader } from "@/components/dashboard/page-header"
import { PageTransition } from "@/components/ui/page-transition"
import { SkeletonTable } from "@/components/ui/shimmer-skeleton"
import { BookGridSkeleton } from "@/components/books/book-grid-skeleton"
import { BookTable } from "@/components/books/book-table"
import { BookCard } from "@/components/books/book-card"
import { BookDetailModal } from "@/components/books/book-detail-modal"
import { BookFormModal } from "@/components/books/book-form-modal"
import { BookDeleteModal } from "@/components/books/book-delete-modal"
import { BookPagination } from "@/components/books/book-pagination"
import { EmptyStateNoResults, EmptyStateNoBooks } from "@/components/ui/empty-state"
import { SmartErrorBanner } from "@/components/ui/error-state"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Plus, Search, RefreshCw, LayoutGrid, List, X,
} from "lucide-react"
import { toast } from "sonner"

type ViewMode = "table" | "grid"

export default function BooksPage() {
  const { isLoading: authLoading } = useProtectedRoute()
  const { user } = useAuth()
  // Use centralized permission check
  const canEdit = canManageBooks(user?.role)

  const {
    paginated, filtered, categories, isLoading, error,
    fetchBooks,
    search, setSearch,
    categoryFilter, setCategoryFilter,
    statusFilter, setStatusFilter,
    sortField, sortDir, toggleSort,
    page, setPage, totalPages, pageSize,
    allBooks,
  } = useBooks({ pageSize: 12 })

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  // Modal state
  const [detailBook, setDetailBook] = useState<BookItem | null>(null)
  const [formMode, setFormMode] = useState<"add" | "edit">("add")
  const [formBook, setFormBook] = useState<BookItem | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteBook, setDeleteBook] = useState<BookItem | null>(null)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch on mount
  useEffect(() => {
    if (!authLoading) fetchBooks()
  }, [authLoading, fetchBooks])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openAdd = useCallback(() => {
    setFormMode("add")
    setFormBook(null)
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((book: BookItem) => {
    setFormMode("edit")
    setFormBook(book)
    setFormOpen(true)
  }, [])

  const handleFormSubmit = useCallback(async (values: BookFormValues) => {
    setIsSubmitting(true)
    try {
      if (formMode === "add") {
        await booksApi.add(values)
        toast.success("Book added", { description: `"${values.title}" added to catalogue` })
      } else if (formBook) {
        await booksApi.update(formBook.id, values)
        toast.success("Book updated", { description: `"${values.title}" has been updated` })
      }
      setFormOpen(false)
      fetchBooks()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong"
      toast.error(formMode === "add" ? "Failed to add book" : "Failed to update book", {
        description: msg,
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formMode, formBook, fetchBooks])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteBook) return
    setIsDeleting(true)
    try {
      await booksApi.delete(deleteBook.id)
      toast.success("Book deleted", { description: `"${deleteBook.title}" removed from catalogue` })
      setDeleteBook(null)
      fetchBooks()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong"
      toast.error("Failed to delete book", { description: msg })
    } finally {
      setIsDeleting(false)
    }
  }, [deleteBook, fetchBooks])

  const clearFilters = useCallback(() => {
    setSearch("")
    setCategoryFilter("all")
    setStatusFilter("all")
  }, [setSearch, setCategoryFilter, setStatusFilter])

  const hasActiveFilters = search || categoryFilter !== "all" || statusFilter !== "all"

  if (authLoading) return null

  return (
    <PageTransition>
      <TooltipProvider delayDuration={200}>
        <div className="space-y-6">
        {/* Page header */}
        <PageHeader title="Book Management" description="Browse and manage your library catalogue">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border"
                onClick={fetchBooks}
                disabled={isLoading}
                aria-label="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>

          {canEdit && (
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={openAdd}
            >
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          )}
        </PageHeader>

        {/* Error banner */}
        {error && !isLoading && (
          <SmartErrorBanner
            message={error}
            onRetry={fetchBooks}
          />
        )}

        {/* Toolbar: search + filters + view toggle */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Search (full width on mobile) */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search title, author, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Row 2: Filters + view toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 sm:w-40 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "available" | "issued")}>
              <SelectTrigger className="w-32 sm:w-36 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-muted-foreground hover:text-foreground px-2"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </Button>
            )}

            {/* View toggle — pushed to right */}
            <div className="flex items-center rounded-lg border border-border bg-input p-0.5 ml-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      viewMode === "table"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Table view"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Table view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {viewMode === "table" ? (
                <SkeletonTable rows={8} cols={6} />
              ) : (
                <BookGridSkeleton count={12} />
              )}
            </motion.div>
          ) : paginated.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {hasActiveFilters ? (
                <EmptyStateNoResults onClear={clearFilters} />
              ) : (
                <EmptyStateNoBooks onAdd={canEdit ? openAdd : undefined} />
              )}
            </motion.div>
          ) : viewMode === "table" ? (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <BookTable
                books={paginated}
                canEdit={canEdit}
                sortField={sortField}
                sortDir={sortDir}
                onSort={toggleSort}
                onView={setDetailBook}
                onEdit={openEdit}
                onDelete={setDeleteBook}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {paginated.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={i}
                  canEdit={canEdit}
                  onView={setDetailBook}
                  onEdit={openEdit}
                  onDelete={setDeleteBook}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!isLoading && (
          <BookPagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        )}

        {/* Stats line when no pagination */}
        {!isLoading && totalPages <= 1 && filtered.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {filtered.length === allBooks.length
              ? `${allBooks.length} books in catalogue`
              : `Showing ${filtered.length} of ${allBooks.length} books`}
          </p>
        )}
      </div>

      {/* Modals */}
      <BookDetailModal
        book={detailBook}
        open={!!detailBook}
        canEdit={canEdit}
        onClose={() => setDetailBook(null)}
        onEdit={(b) => { setDetailBook(null); openEdit(b) }}
      />

      <BookFormModal
        open={formOpen}
        mode={formMode}
        book={formBook}
        isSubmitting={isSubmitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <BookDeleteModal
        book={deleteBook}
        open={!!deleteBook}
        isDeleting={isDeleting}
        onClose={() => setDeleteBook(null)}
        onConfirm={handleDeleteConfirm}
      />
      </TooltipProvider>
    </PageTransition>
  )
}
