"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { transactionsApi } from "@/lib/api"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, differenceInDays, parseISO } from "date-fns"
import { RotateCcw, Check, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react"

interface IssuedBook {
  id: number
  bookTitle: string
  userName: string
  issueDate: string
  dueDate: string
  status: "on-time" | "overdue"
}

export default function ReturnBookPage() {
  const router = useRouter()
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([])
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }
    }
  }, [router])

  const fetchActiveTransactions = () => {
    transactionsApi.getAll()
      .then((response) => {
        if (response.success && response.data) {
          const activeTransactions = response.data
            .filter((t: any) => !t.returnDate)
            .map((t: any) => ({
              id: t.id,
              bookTitle: t.bookTitle,
              userName: t.userName,
              issueDate: t.issueDate,
              dueDate: t.dueDate,
              status: new Date(t.dueDate) < new Date() ? "overdue" : "on-time"
            }))
          setIssuedBooks(activeTransactions)
        }
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error)
        setErrorMessage("Failed to load issued books: " + error.message)
      })
  }

  useEffect(() => {
    fetchActiveTransactions()
  }, [])

  const selectedIssue = issuedBooks.find((book) => String(book.id) === selectedTransactionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!selectedTransactionId) {
      setErrorMessage("Please select a book to return.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await transactionsApi.return(Number(selectedTransactionId))
      if (response.success) {
        const fine = response.data.fine
        setSuccessMessage(
          fine && fine > 0
            ? `Book returned successfully! Fine charged: ₹${fine}`
            : "Book returned successfully!"
        )
        setIsSuccess(true)
        setSelectedTransactionId("")
        // Refresh the list immediately so the returned book disappears
        fetchActiveTransactions()
        setTimeout(() => {
          setIsSuccess(false)
          setSuccessMessage("")
        }, 3000)
      }
    } catch (error: any) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateFine = (dueDate: string) => {
    const today = new Date()
    const due = parseISO(dueDate)
    const daysOverdue = differenceInDays(today, due)
    if (daysOverdue <= 0) return 0
    return daysOverdue * 5
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Return Book"
        description="Process book returns from library members"
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
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

            {/* Feedback banners — inside the card, above the selector */}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-primary">{successMessage}</p>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Select Issued Book</Label>
                <Select
                  value={selectedTransactionId}
                  onValueChange={(v) => { setSelectedTransactionId(v); setErrorMessage("") }}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose an issued book" />
                  </SelectTrigger>
                  <SelectContent>
                    {issuedBooks.length === 0 ? (
                      <SelectItem value="none" disabled>No issued books</SelectItem>
                    ) : (
                      issuedBooks.map((book) => (
                        <SelectItem key={book.id} value={String(book.id)}>
                          <div className="flex items-center gap-2">
                            <span>{book.bookTitle}</span>
                            <span className="text-muted-foreground">-</span>
                            <span className="text-muted-foreground">
                              {book.userName}
                            </span>
                            {book.status === "overdue" && (
                              <Badge
                                variant="destructive"
                                className="ml-2 text-xs"
                              >
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedIssue && (
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-medium text-foreground">Issue Details</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Book Title</p>
                    <p className="font-medium text-foreground">
                      {selectedIssue.bookTitle}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Member</p>
                    <p className="font-medium text-foreground">
                      {selectedIssue.userName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium text-foreground">
                      {format(parseISO(selectedIssue.issueDate), "PPP")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium text-foreground">
                      {format(parseISO(selectedIssue.dueDate), "PPP")}
                    </p>
                  </div>
                </div>

                {selectedIssue.status === "overdue" && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">
                        Book is Overdue
                      </p>
                      <p className="text-sm text-destructive/80">
                        {differenceInDays(new Date(), parseISO(selectedIssue.dueDate))}{" "}
                        days overdue. Fine: ₹
                        {calculateFine(selectedIssue.dueDate).toFixed(2)}
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
              onClick={() => {
                setSelectedTransactionId("")
                setErrorMessage("")
                setSuccessMessage("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedTransactionId || isSubmitting || isSuccess}
              className={cn(
                "gap-2",
                isSuccess
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isSubmitting ? (
                "Processing..."
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
      </div>
    </div>
  )
}
