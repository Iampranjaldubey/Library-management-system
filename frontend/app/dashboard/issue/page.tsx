"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { booksApi, transactionsApi, dedupeBooks } from "@/lib/api"
import { PageHeader } from "@/components/dashboard/page-header"
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
import { format } from "date-fns"
import { BookPlus, Check, AlertCircle, CheckCircle2 } from "lucide-react"

export default function IssueBookPage() {
  const router = useRouter()
  const [availableBooks, setAvailableBooks] = useState<Array<{ id: number; title: string; author: string; isbn: string }>>([])
  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Check if user is logged in and pre-fill userId from stored session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }
      try {
        const stored = localStorage.getItem("user")
        if (stored) {
          const user = JSON.parse(stored)
          if (user?.id) setUserId(String(user.id))
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [router])

  const fetchAvailableBooks = () => {
    booksApi.getAll(true)
      .then((response) => {
        if (response.success && response.data) {
          const mapped = response.data.map((b: any) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            isbn: b.isbn,
          }))
          setAvailableBooks(dedupeBooks(mapped))
        }
      })
      .catch((error) => {
        console.error("Error fetching books:", error)
      })
  }

  useEffect(() => {
    fetchAvailableBooks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!selectedBookId || !userId) {
      setErrorMessage("Please select a book and enter a user ID.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await transactionsApi.issue(Number(selectedBookId), Number(userId))
      if (response.success) {
        const dueDate = format(new Date(response.data.dueDate), "PPP")
        setSuccessMessage(`Book issued successfully! Due date: ${dueDate}`)
        setIsSuccess(true)
        setSelectedBookId("")
        // Refresh available books immediately so the issued book disappears
        fetchAvailableBooks()
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Book"
        description="Issue a book to a library member"
      />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Issue Details</h2>
                <p className="text-sm text-muted-foreground">
                  Fill in the details to issue a book
                </p>
              </div>
            </div>

            {/* Feedback banners — inside the card, above the fields */}
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="book" className="text-foreground">
                  Select Book
                </Label>
                <Select value={selectedBookId} onValueChange={(v) => { setSelectedBookId(v); setErrorMessage("") }}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.length === 0 ? (
                      <SelectItem value="none" disabled>No available books</SelectItem>
                    ) : (
                      availableBooks.map((book) => (
                        <SelectItem key={book.id} value={String(book.id)}>
                          {book.title} - {book.author}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="userId" className="text-foreground">
                  User ID
                </Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setErrorMessage("") }}
                  required
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Defaults to your own ID. Change to issue to another user.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-foreground">
                  Issue Date
                </Label>
                <Input
                  id="issueDate"
                  type="text"
                  value={format(new Date(), "PPP")}
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-foreground">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="text"
                  value={format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "PPP")}
                  disabled
                  className="bg-muted border-border text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Automatically set to 7 days from today
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={() => {
                setSelectedBookId("")
                setUserId("")
                setErrorMessage("")
                setSuccessMessage("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSuccess || !selectedBookId || !userId}
              className={cn(
                "gap-2",
                isSuccess
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isSubmitting ? (
                "Issuing..."
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
      </div>
    </div>
  )
}
