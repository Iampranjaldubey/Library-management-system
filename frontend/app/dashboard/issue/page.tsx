"use client"

import { useState, useEffect, useCallback } from "react"
import { booksApi, transactionsApi, dedupeBooks, ApiError, type BookDto } from "@/lib/api"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { useAuth } from "@/context/auth-context"
import { PageHeader } from "@/components/dashboard/page-header"
import { FormSkeleton } from "@/components/dashboard/skeletons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { BookPlus, Check } from "lucide-react"
import { toast } from "sonner"

interface AvailableBook {
  id: number
  title: string
  author: string
  isbn: string
}

export default function IssueBookPage() {
  const { isLoading: authLoading } = useProtectedRoute()
  const { user } = useAuth()

  const [availableBooks, setAvailableBooks] = useState<AvailableBook[]>([])
  const [isBooksLoading, setIsBooksLoading] = useState(true)
  const [selectedBookId, setSelectedBookId] = useState("")
  const [userId, setUserId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Pre-fill userId from auth context
  useEffect(() => {
    if (user?.id) setUserId(String(user.id))
  }, [user])

  const fetchAvailableBooks = useCallback(async () => {
    setIsBooksLoading(true)
    try {
      const res = await booksApi.getAll(true)
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map((b: BookDto) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          isbn: b.isbn,
        }))
        setAvailableBooks(dedupeBooks(mapped))
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      toast.error("Failed to load available books", { description: msg })
    } finally {
      setIsBooksLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchAvailableBooks()
  }, [authLoading, fetchAvailableBooks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBookId || !userId) {
      toast.error("Please select a book and enter a user ID")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await transactionsApi.issue(Number(selectedBookId), Number(userId))
      if (res.success) {
        // Use parseISO — dueDate is "YYYY-MM-DD" (LocalDate, not LocalDateTime)
        const dueDate = format(parseISO(res.data.dueDate), "PPP")
        toast.success("Book issued successfully", {
          description: `Due date: ${dueDate}`,
        })
        setIsSuccess(true)
        setSelectedBookId("")
        fetchAvailableBooks()
        setTimeout(() => setIsSuccess(false), 3000)
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      toast.error("Failed to issue book", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedBookId("")
    setUserId(user?.id ? String(user.id) : "")
    setIsSuccess(false)
  }

  if (authLoading) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Issue Book" description="Issue a book to a library member" />

      <div className="max-w-2xl">
        {isBooksLoading ? (
          <FormSkeleton fields={4} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              {/* Card header */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Issue Details</h2>
                  <p className="text-sm text-muted-foreground">Fill in the details to issue a book</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Book selector */}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-foreground">Select Book</Label>
                  <Select
                    value={selectedBookId}
                    onValueChange={setSelectedBookId}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Choose an available book" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBooks.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No available books
                        </SelectItem>
                      ) : (
                        availableBooks.map((book) => (
                          <SelectItem key={book.id} value={String(book.id)}>
                            {book.title} — {book.author}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* User ID */}
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="userId" className="text-foreground">
                    User ID
                  </Label>
                  <Input
                    id="userId"
                    type="number"
                    placeholder="Enter user ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="bg-input border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Defaults to your own ID. Change to issue to another member.
                  </p>
                </div>

                {/* Issue date (read-only) */}
                <div className="space-y-2">
                  <Label className="text-foreground">Issue Date</Label>
                  <Input
                    value={format(new Date(), "PPP")}
                    disabled
                    className="bg-muted border-border text-muted-foreground"
                  />
                </div>

                {/* Due date (read-only) */}
                <div className="space-y-2">
                  <Label className="text-foreground">Due Date</Label>
                  <Input
                    value={format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "PPP")}
                    disabled
                    className="bg-muted border-border text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">7 days from today</p>
                </div>
              </div>
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
                disabled={isSubmitting || isSuccess || !selectedBookId || !userId}
                className={cn(
                  "gap-2 bg-primary text-primary-foreground hover:bg-primary/90",
                  isSuccess && "bg-primary"
                )}
              >
                {isSubmitting ? (
                  "Issuing…"
                ) : isSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Book Issued
                  </>
                ) : (
                  "Issue Book"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
