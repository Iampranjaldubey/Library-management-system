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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, BookPlus, Check } from "lucide-react"

const availableBooks = [
  { id: "1", title: "Clean Code", author: "Robert C. Martin" },
  { id: "3", title: "Design Patterns", author: "Gang of Four" },
  { id: "6", title: "Introduction to Algorithms", author: "Thomas H. Cormen" },
  { id: "7", title: "Refactoring", author: "Martin Fowler" },
]

const members = [
  { id: "M001", name: "John Doe", email: "john@example.com" },
  { id: "M002", name: "Jane Smith", email: "jane@example.com" },
  { id: "M003", name: "Bob Johnson", email: "bob@example.com" },
  { id: "M004", name: "Alice Williams", email: "alice@example.com" },
]

export default function IssueBookPage() {
  const [dueDate, setDueDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)
    setTimeout(() => setIsSuccess(false), 3000)
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="book" className="text-foreground">
                  Select Book
                </Label>
                <Select>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} - {book.author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="member" className="text-foreground">
                  Select Member
                </Label>
                <Select>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Choose a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-input border-border",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes" className="text-foreground">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes..."
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isSuccess}
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
