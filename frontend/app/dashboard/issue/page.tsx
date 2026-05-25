"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { useIssueForm } from "@/hooks/use-issue-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { PageTransition } from "@/components/ui/page-transition"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { SmartErrorBanner } from "@/components/ui/error-state"
import { BookSelect } from "@/components/issue/book-select"
import { UserIdInput } from "@/components/issue/user-id-input"
import { IssueSummaryCard } from "@/components/issue/issue-summary-card"
import { IssueSuccessState } from "@/components/issue/issue-success-state"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/button-loader"
import { Label } from "@/components/ui/label"
import {
  BookPlus, ShieldOff, RefreshCw,
  BookOpen, Users,
} from "lucide-react"

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function IssueSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-border bg-card/50 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <ShimmerSkeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <ShimmerSkeleton className="h-4 w-32" />
            <ShimmerSkeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-2">
          <ShimmerSkeleton className="h-3 w-20" />
          <ShimmerSkeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <ShimmerSkeleton className="h-3 w-20" />
          <ShimmerSkeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 h-40" />
    </div>
  )
}

// ─── Access denied ────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md"
    >
      <div className="rounded-2xl border border-border bg-card/50 p-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <ShieldOff className="h-7 w-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Access restricted</p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Issuing books requires <span className="font-medium text-foreground">ADMIN</span> or{" "}
            <span className="font-medium text-foreground">LIBRARIAN</span> role.
          </p>
        </div>
      </div>
    </motion.div>
  )
}



// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IssueBookPage() {
  const { isLoading: authLoading } = useProtectedRoute({ allowedRoles: ["ADMIN", "LIBRARIAN"] })
  const { user, isAdmin, isLibrarian } = useAuth()
  const canAccess = isAdmin || isLibrarian

  const {
    form,
    availableBooks,
    isBooksLoading,
    booksError,
    issuedResult,
    selectedBook,
    previewDueDate,
    previewIssueDate,
    fetchAvailableBooks,
    onSubmit,
    resetForm,
  } = useIssueForm({ defaultUserId: user?.id ? String(user.id) : "" })

  const { formState: { errors, isSubmitting }, setValue, watch } = form
  const bookId = watch("bookId")
  const userId = watch("userId")
  const isSelf = !!user?.id && userId === String(user.id)

  // Fetch books once auth resolves and user has access
  useEffect(() => {
    if (!authLoading && canAccess) fetchAvailableBooks()
  }, [authLoading, canAccess, fetchAvailableBooks])

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (authLoading) return null
  if (!canAccess) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <PageHeader title="Issue Book" description="Issue a book to a library member" />
          <AccessDenied />
        </div>
      </PageTransition>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <PageTransition>
      <div className="space-y-6">
      {/* Page header */}
      <PageHeader title="Issue Book" description="Issue a book to a library member">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border"
          onClick={fetchAvailableBooks}
          disabled={isBooksLoading}
          aria-label="Refresh available books"
        >
          <RefreshCw className={`h-4 w-4 ${isBooksLoading ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      {/* Error banner */}
      {booksError && !isBooksLoading && (
        <SmartErrorBanner
          message={booksError}
          onRetry={fetchAvailableBooks}
        />
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {isBooksLoading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <IssueSkeleton />
          </motion.div>
        ) : issuedResult ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl"
          >
            <IssueSuccessState
              result={issuedResult}
              onIssueAnother={() => resetForm(true)}
            />
          </motion.div>
        ) : (
          /* ── Form ── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl"
          >
            <form onSubmit={onSubmit} noValidate className="space-y-5">

              {/* ── Main card ── */}
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">

                {/* Card header */}
                <div className="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                    <BookPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground">Issue Details</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select a book and member to create an issue record
                    </p>
                  </div>

                  {/* Available count badge */}
                  {availableBooks.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 shrink-0">
                      <BookOpen className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {availableBooks.length} available
                      </span>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">

                  {/* Book selector */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      Select Book
                      <span className="text-destructive">*</span>
                    </Label>
                    <BookSelect
                      books={availableBooks}
                      value={bookId}
                      onChange={(id) => setValue("bookId", id, { shouldValidate: true })}
                      error={errors.bookId?.message}
                      disabled={isSubmitting}
                    />
                  </motion.div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-3 text-[11px] text-muted-foreground/60 uppercase tracking-widest">
                        Member
                      </span>
                    </div>
                  </div>

                  {/* User ID */}
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      Member User ID
                      <span className="text-destructive">*</span>
                    </Label>
                    <UserIdInput
                      value={userId}
                      onChange={(v) => setValue("userId", v, { shouldValidate: !!errors.userId })}
                      error={errors.userId?.message}
                      disabled={isSubmitting}
                      isSelf={isSelf}
                    />
                  </motion.div>
                </div>
              </div>

              {/* ── Preview card ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <IssueSummaryCard
                  book={selectedBook}
                  issueDate={previewIssueDate}
                  dueDate={previewDueDate}
                />
              </motion.div>

              {/* ── Actions ── */}
              <motion.div
                className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted/50 sm:w-auto"
                  onClick={() => resetForm(true)}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>

                <LoadingButton
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Issuing…"
                  showProgress
                  disabled={!bookId || !userId}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:min-w-[130px]"
                >
                  <BookPlus className="h-4 w-4" />
                  Issue Book
                </LoadingButton>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </PageTransition>
  )
}
