"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { booksApi, transactionsApi, dedupeBooks, ApiError, type BookDto, type TransactionDto } from "@/lib/api"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { canViewAllDashboardStats } from "@/lib/permissions"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { AnalyticsCard, AnalyticsCardSkeleton } from "@/components/dashboard/analytics-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { ActivityOverview } from "@/components/dashboard/activity-overview"
import { DataTable, type Book } from "@/components/dashboard/data-table"
import { TableSkeleton } from "@/components/dashboard/skeletons"
import { SmartErrorBanner } from "@/components/ui/error-state"
import { Button } from "@/components/ui/button"
import { BookOpen, BookCheck, BookX, ArrowLeftRight, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/animations"

function mapBookDto(b: BookDto): Book {
  return {
    id: String(b.id),
    title: b.title || "Unknown",
    author: b.author || "Unknown",
    isbn: b.isbn || "N/A",
    category: b.category || "Uncategorized",
    status: b.available ? "available" : "issued",
    copies: 1,
  }
}

export default function DashboardPage() {
  const { isLoading: authLoading } = useProtectedRoute()
  const { user } = useAuth()
  // Use centralized permission check
  const canViewTransactions = canViewAllDashboardStats(user?.role)

  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [totalBooks, setTotalBooks] = useState(0)
  const [issuedBooks, setIssuedBooks] = useState(0)
  const [availableBooks, setAvailableBooks] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<TransactionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Always fetch books — all authenticated roles can read them
      // Only fetch transactions for ADMIN / LIBRARIAN — USER role has no access
      const requests: [Promise<unknown>, Promise<unknown>] = [
        booksApi.getAll(),
        canViewTransactions ? transactionsApi.getAll() : Promise.resolve(null),
      ]

      const [booksRes, txRes] = await Promise.allSettled(requests)

      // ── Books ──────────────────────────────────────────────────────────────
      if (booksRes.status === "fulfilled") {
        const value = booksRes.value as Awaited<ReturnType<typeof booksApi.getAll>>
        const raw = Array.isArray(value?.data) ? value.data.map(mapBookDto) : []
        const unique = dedupeBooks(raw)
        setTotalBooks(unique.length)
        setIssuedBooks(unique.filter((b) => b.status === "issued").length)
        setAvailableBooks(unique.filter((b) => b.status === "available").length)
        setRecentBooks(unique.slice(0, 6))
      } else {
        const err = booksRes.reason
        const isOffline = err instanceof ApiError && err.status === 0
        const msg = isOffline
          ? "Backend is not running. Start the Spring Boot server and refresh."
          : err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : String(err)
        if (!isOffline) toast.error("Failed to load books", { description: msg })
        setError(msg)
      }

      // ── Transactions (ADMIN / LIBRARIAN only) ──────────────────────────────
      if (!canViewTransactions) {
        // USER role — skip silently, stat card is hidden for them
        setTotalTransactions(0)
        setRecentTransactions([])
      } else if (txRes.status === "fulfilled") {
        const value = txRes.value as Awaited<ReturnType<typeof transactionsApi.getAll>>
        const transactions = Array.isArray(value?.data) ? value.data : []
        setTotalTransactions(transactions.length)
        // Sort by ID descending to get most recent
        setRecentTransactions(transactions.sort((a, b) => b.id - a.id))
      } else {
        const err = txRes.reason
        // Network error is already surfaced by the books banner — skip toast
        if (!(err instanceof ApiError && err.status === 0)) {
          const msg = err instanceof ApiError
            ? `${err.message} (HTTP ${err.status})`
            : String(err)
          toast.error("Failed to load transactions", { description: msg })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [canViewTransactions])

  useEffect(() => {
    if (!authLoading) fetchData()
  }, [authLoading, fetchData])

  if (authLoading) return null

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={staggerItem} className="flex items-stretch gap-3">
        <WelcomeSection />
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 border-border shrink-0 self-start mt-0"
          onClick={fetchData}
          disabled={isLoading}
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <SmartErrorBanner message={error} onRetry={fetchData} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analytics Cards */}
      <motion.div variants={staggerItem} className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: canViewTransactions ? 4 : 3 }).map((_, i) => (
            <AnalyticsCardSkeleton key={i} />
          ))
        ) : (
          <>
            <AnalyticsCard
              title="Total Books"
              value={totalBooks}
              icon={BookOpen}
              description="in catalogue"
              variant="primary"
              delay={0}
            />
            <AnalyticsCard
              title="Available"
              value={availableBooks}
              icon={BookCheck}
              description="ready to issue"
              variant="success"
              delay={0.05}
            />
            <AnalyticsCard
              title="Issued"
              value={issuedBooks}
              icon={BookX}
              description="currently out"
              variant="warning"
              delay={0.1}
            />
            {canViewTransactions && (
              <AnalyticsCard
                title="Transactions"
                value={totalTransactions}
                icon={ArrowLeftRight}
                description="all time"
                variant="default"
                delay={0.15}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Two Column Layout */}
      <motion.div variants={staggerItem} className="grid gap-6 lg:grid-cols-3">
        {/* Right Column — shown first on mobile for quick access */}
        <div className="space-y-6 lg:order-2">
          {/* Quick Actions */}
          <QuickActions />

          {/* Activity Overview */}
          <ActivityOverview
            totalBooks={totalBooks}
            availableBooks={availableBooks}
            issuedBooks={issuedBooks}
            totalTransactions={totalTransactions}
            isLoading={isLoading}
          />
        </div>

        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6 lg:order-1">
          {/* Recent Transactions - Only for ADMIN/LIBRARIAN */}
          {canViewTransactions && (
            <RecentTransactions
              transactions={recentTransactions}
              isLoading={isLoading}
            />
          )}

          {/* Recent Books */}
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Books</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                  Latest additions to catalogue
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs sm:text-sm">
                <Link href="/dashboard/books">
                  View all
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="p-4 sm:p-6">
              {isLoading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : (
                <DataTable books={recentBooks} onRefresh={fetchData} />
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
