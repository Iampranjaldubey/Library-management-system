"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { useReturnForm } from "@/hooks/use-return-form"
import { PageHeader } from "@/components/dashboard/page-header"
import { ReturnBookForm } from "@/components/return/return-book-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ShieldOff, AlertCircle, RefreshCw } from "lucide-react"

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ReturnSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
      {/* Left */}
      <div className="space-y-5">
        {/* Alert strip placeholder */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-muted/20">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          {/* Body */}
          <div className="px-6 py-6 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-3 w-64" />
          </div>
          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/10">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-40 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right preview */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                <div className="flex-1 flex justify-between gap-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Access denied ────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-md"
    >
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-10 flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border">
          <ShieldOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <p className="font-semibold text-foreground">Access restricted</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Processing returns requires the{" "}
            <span className="font-semibold text-foreground">ADMIN</span> or{" "}
            <span className="font-semibold text-foreground">LIBRARIAN</span> role.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3.5">
        <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive">Failed to load issued books</p>
          <p className="text-xs text-destructive/70 mt-0.5">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs shrink-0"
        >
          Retry
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReturnBookPage() {
  const { isLoading: authLoading } = useProtectedRoute({ allowedRoles: ["ADMIN", "LIBRARIAN"] })
  const { isAdmin, isLibrarian } = useAuth()
  const canAccess = isAdmin || isLibrarian

  const returnForm = useReturnForm()
  const { isTxLoading, fetchError, fetchActiveTransactions } = returnForm

  // Trigger the fetch exactly once — after auth resolves and role is confirmed.
  // isTxLoading starts false so we show the skeleton only while the real fetch
  // is in flight, not during the auth hydration phase.
  useEffect(() => {
    if (!authLoading && canAccess) fetchActiveTransactions()
  }, [authLoading, canAccess, fetchActiveTransactions])

  if (authLoading) return null

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Return Book"
          description="Process book returns from library members"
        />
        <AccessDenied />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title="Return Book"
        description="Process book returns from library members"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-border"
          onClick={fetchActiveTransactions}
          disabled={isTxLoading}
          aria-label="Refresh issued books"
        >
          <RefreshCw className={`h-4 w-4 ${isTxLoading ? "animate-spin" : ""}`} />
        </Button>
      </PageHeader>

      {/* Error banner */}
      <AnimatePresence>
        {fetchError && !isTxLoading && (
          <ErrorBanner message={fetchError} onRetry={fetchActiveTransactions} />
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isTxLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ReturnSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ReturnBookForm {...returnForm} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
