"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format, differenceInDays } from "date-fns"
import { RotateCcw, Check, AlertTriangle, Search } from "lucide-react"

const issuedBooks = [
  {
    id: "ISS001",
    bookTitle: "The Pragmatic Programmer",
    memberId: "M001",
    memberName: "John Doe",
    issueDate: new Date("2026-04-01"),
    dueDate: new Date("2026-04-15"),
    status: "on-time",
  },
  {
    id: "ISS002",
    bookTitle: "Atomic Habits",
    memberId: "M002",
    memberName: "Jane Smith",
    issueDate: new Date("2026-03-20"),
    dueDate: new Date("2026-04-03"),
    status: "overdue",
  },
  {
    id: "ISS003",
    bookTitle: "System Design Interview",
    memberId: "M003",
    memberName: "Bob Johnson",
    issueDate: new Date("2026-04-10"),
    dueDate: new Date("2026-04-24"),
    status: "on-time",
  },
  {
    id: "ISS004",
    bookTitle: "Deep Work",
    memberId: "M004",
    memberName: "Alice Williams",
    issueDate: new Date("2026-03-15"),
    dueDate: new Date("2026-03-29"),
    status: "overdue",
  },
]

const bookConditions = ["Excellent", "Good", "Fair", "Poor", "Damaged"]

export default function ReturnBookPage() {
  const [selectedBook, setSelectedBook] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const selectedIssue = issuedBooks.find((book) => book.id === selectedBook)

  const filteredBooks = issuedBooks.filter(
    (book) =>
      book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setSelectedBook("")
    }, 3000)
  }

  const calculateFine = (dueDate: Date) => {
    const today = new Date()
    const daysOverdue = differenceInDays(today, dueDate)
    if (daysOverdue <= 0) return 0
    return daysOverdue * 0.5 // $0.50 per day
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

            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by book title, member name, or issue ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Select Issued Book</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose an issued book" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBooks.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        <div className="flex items-center gap-2">
                          <span>{book.bookTitle}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-muted-foreground">
                            {book.memberName}
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
                    ))}
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
                      {selectedIssue.memberName} ({selectedIssue.memberId})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-medium text-foreground">
                      {format(selectedIssue.issueDate, "PPP")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium text-foreground">
                      {format(selectedIssue.dueDate, "PPP")}
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
                        {differenceInDays(new Date(), selectedIssue.dueDate)}{" "}
                        days overdue. Fine: $
                        {calculateFine(selectedIssue.dueDate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="condition" className="text-foreground">
                    Book Condition
                  </Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookConditions.map((condition) => (
                        <SelectItem
                          key={condition}
                          value={condition.toLowerCase()}
                        >
                          {condition}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnNotes" className="text-foreground">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="returnNotes"
                    placeholder="Add any notes about the return..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={() => setSelectedBook("")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedBook || isSubmitting || isSuccess}
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
