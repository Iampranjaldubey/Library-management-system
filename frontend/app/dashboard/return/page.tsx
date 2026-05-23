"use client"

import { useState, useEffect, useCallback } from "react"
import { transactionsApi, ApiError, type TransactionDto } from "@/lib/api"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { PageHeader } from "@/components/dashboard/page-header"
import { FormSkeleton } from "@/components/dashboard/skeletons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format, differenceInCalendarDays, parseISO } from "date-fns"
import { RotateCcw, Check, AlertTriangle, AlertCircle, ShieldOff } from "lucide-react"
import { toast } from "sonner"

export default function ReturnBookPage() {
  const { isLoading: authLoading } = useProtectedRoute({ allowedRoles: ["ADMIN", "LIBRARIAN"] })
  const { isAdmin, isLibrarian } = useAuth()
  const canAccess = isAdmin || isLibrarian

  // Only show ACTIVE and OVERDUE transactions — backend already filters by status
  const [issuedBooks, setIssuedBooks] = useState<TransactionDto[]>([])
  const [isTxLoading, setIsTxLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedTransactionId, setSelectedTransactionId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const fetchActiveTransactions = useCallback(async () => {
    setIsTxLoading(true)
    setFetchError(null)
    try {
      const res = await transactionsApi.getAll()
      if (res.success && Array.isArray(res.data)) {
        const active = res.data.filter(
          (t) => t.status === "ACTIVE" || t.status === "OVERDUE"
        )
        setIssuedBooks(active)
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? `${err.message} (HTTP ${err.status})`
          : String(err)
      setFetchError(msg)
      toast.error("Failed to load issued books", { description: msg })
    } finally {
      setIsTxLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && canAccess) fetchActiveTransactions()
    else if (!authLoading && !canAccess) setIsTxLoading(false)
  }, [authLoading, canAccess, fetchActiveTransactions])

  const selectedIssue = issuedBooks.find(
    (b) => String(b.id) === selectedTransactionId
  )

  /**
   * Fine preview — uses differenceInCalendarDays with parseISO so the
   * comparison is always in local calendar days, not UTC milliseconds.
   * The backend computes the authoritative fine on return; this is display-only.
   */
  const previewFine = (dueDate: string): number => {
    const days = differenceInCalendarDays(new Date(), parseISO(dueDate))
    return days > 0 ? days * 5 : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTransactionId) {
      toast.error("Please select a book to return")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await transactionsApi.return(Number(selectedTransactionId))
      if (res.success) {
        const fine = res.data.fine
        if (fine && fine > 0) {
          toast.warning("Book returned with fine", {
            description: `Fine charged: ₹${fine.toFixed(2)}`,
          })
        } else {
          toast.success("Book returned successfully")
        }
        setIsSuccess(true)
        setSelectedTransactionId("")
        fetchActiveTransactions()
        setTimeout(() => setIsSuccess(false), 3000)
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      toast.error("Failed to process return", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedTransactionId("")
    setIsSuccess(false)
  }

  if (authLoading) return null

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <PageHeader title="Return Book" description="Process book returns from library members" />
        <div className="max-w-2xl rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <ShieldOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Access restricted</p>
            <p className="text-sm text-muted-foreground mt-1">
              Processing returns requires ADMIN or LIBRARIAN role.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Book"
        description="Process book returns from library members"
      />

      <div className="max-w-2xl">
        {isTxLoading ? (
          <FormSkeleton fields={2} />
        ) : fetchError ? (
          /* Error state — shown when the transactions fetch fails */
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-destructive">
                Failed to load issued books
              </p>
              <p className="text-xs text-destructive/80 mt-0.5">{fetchError}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs shrink-0"
              onClick={fetchActiveTransactions}
            >
              Retry
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              {/* Card header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <RotateCcw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Return Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Select an issued book to process return
                  </p>
                </div>
              </div>

              {/* Book selector */}
              <div className="space-y-2">
                <Label className="text-foreground">Select Issued Book</Label>
                <Select
                  value={selectedTransactionId}
                  onValueChange={setSelectedTransactionId}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose an issued book" />
                  </SelectTrigger>
                  <SelectContent>
                    {issuedBooks.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No issued books
                      </SelectItem>
                    ) : (
                      issuedBooks.map((book) => (
                        <SelectItem key={book.id} value={String(book.id)}>
                          <span className="flex items-center gap-2">
                            {book.bookTitle} — {book.userName}
                            {book.status === "OVERDUE" && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] px-1.5 py-0 ml-1"
                              >
                                Overdue
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected book details */}
              {selectedIssue && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground">
                    Issue Details
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Book
                      </p>
                      <p className="font-medium text-foreground">
                        {selectedIssue.bookTitle}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Member
                      </p>
                      <p className="font-medium text-foreground">
                        {selectedIssue.userName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Issue Date
                      </p>
                      <p className="font-medium text-foreground">
                        {format(parseISO(selectedIssue.issueDate), "PPP")}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Due Date
                      </p>
                      <p className="font-medium text-foreground">
                        {format(parseISO(selectedIssue.dueDate), "PPP")}
                      </p>
                    </div>
                  </div>

                  {selectedIssue.status === "OVERDUE" && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive text-sm">
                          Book is Overdue
                        </p>
                        <p className="text-sm text-destructive/80 mt-0.5">
                          {differenceInCalendarDays(
                            new Date(),
                            parseISO(selectedIssue.dueDate)
                          )}{" "}
                          days overdue — Estimated fine: ₹
                          {previewFine(selectedIssue.dueDate).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-border text-foreground"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!selectedTransactionId || isSubmitting || isSuccess}
                className={cn(
                  "gap-2 bg-primary text-primary-foreground hover:bg-primary/90",
                  isSuccess && "bg-primary"
                )}
              >
                {isSubmitting ? (
                  "Processing…"
                ) : isSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Book Returned
                  </>
                ) : (
                  "Process Return"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
