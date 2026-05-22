"use client"

import { useState, useEffect, useCallback } from "react"
import { booksApi, dedupeBooks, ApiError, type BookDto } from "@/lib/api"
import { useProtectedRoute } from "@/hooks/use-protected-route"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable, type Book } from "@/components/dashboard/data-table"
import { TableSkeleton } from "@/components/dashboard/skeletons"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function BooksPage() {
  const { isLoading: authLoading } = useProtectedRoute()

  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await booksApi.getAll()
      const mapped: Book[] = Array.isArray(res.data)
        ? res.data.map((b: BookDto) => ({
            id: String(b.id),
            title: b.title || "Unknown",
            author: b.author || "Unknown",
            isbn: b.isbn || "N/A",
            category: b.category || "Uncategorized",
            status: b.available ? "available" : "issued",
            copies: 1,
          }))
        : []
      setAllBooks(dedupeBooks(mapped))
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      if (err instanceof ApiError && err.status === 401) return // handled globally
      toast.error("Failed to load books", { description: msg })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchBooks()
  }, [authLoading, fetchBooks])

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)
      const res = await booksApi.add({
        title: fd.get("title") as string,
        author: fd.get("author") as string,
        isbn: fd.get("isbn") as string,
        category: fd.get("category") as string,
      })
      if (res.success) {
        toast.success("Book added successfully")
        setIsAddDialogOpen(false)
        ;(e.target as HTMLFormElement).reset()
        fetchBooks()
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to add book"
      toast.error("Failed to add book", { description: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [...new Set(allBooks.map((b) => b.category))].sort()

  const filteredBooks = allBooks.filter((book) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      book.title.toLowerCase().includes(q) ||
      book.author.toLowerCase().includes(q) ||
      book.isbn.includes(q)
    const matchesCategory = categoryFilter === "all" || book.category === categoryFilter
    const matchesStatus = statusFilter === "all" || book.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (authLoading) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Book Management" description="Manage your library book inventory">
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
        <Button
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ISBN…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-input border-border text-foreground">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-input border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="issued">Issued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <DataTable books={filteredBooks} onRefresh={fetchBooks} />
      )}

      {/* Footer count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredBooks.length} of {allBooks.length} books
        </p>
      )}

      {/* Add Book dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Book</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the details to add a book to the catalogue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBook} className="space-y-4">
            {(
              [
                { name: "title", label: "Title", placeholder: "e.g. The Great Gatsby" },
                { name: "author", label: "Author", placeholder: "e.g. F. Scott Fitzgerald" },
                { name: "isbn", label: "ISBN", placeholder: "e.g. 978-3-16-148410-0" },
                { name: "category", label: "Category", placeholder: "e.g. Fiction" },
              ] as const
            ).map(({ name, label, placeholder }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`add-${name}`} className="text-foreground">
                  {label}
                </Label>
                <Input
                  id={`add-${name}`}
                  name={name}
                  placeholder={placeholder}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ))}
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
                className="border-border text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? "Adding…" : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
