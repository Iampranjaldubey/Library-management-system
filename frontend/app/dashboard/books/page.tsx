"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { booksApi, dedupeBooks } from "@/lib/api"
import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable, type Book } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search } from "lucide-react"


export default function BooksPage() {
  const router = useRouter()
  const [allBooks, setAllBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const fetchBooks = () => {
    booksApi.getAll()
      .then((response) => {
        console.log("Books response:", response)
        const booksData = response.data
        const mappedBooks: Book[] = Array.isArray(booksData) ? booksData.map((b: any) => ({
          id: String(b.id),
          title: b.title || "Unknown",
          author: b.author || "Unknown",
          isbn: b.isbn || "N/A",
          category: b.category || "Uncategorized",
          status: b.available ? "available" : "issued",
          copies: 1
        })) : []
        setAllBooks(dedupeBooks(mappedBooks))
      })
      .catch((error) => {
        console.error("Error fetching books:", error)
        // Don't show alert on initial load if user is not logged in
        if (error.message !== "Session expired. Please login again.") {
          alert("Failed to fetch books: " + error.message)
        }
      })
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleAddBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const bookData = {
        title: formData.get("title") as string,
        author: formData.get("author") as string,
        isbn: formData.get("isbn") as string,
        category: formData.get("category") as string,
      }

      const response = await booksApi.add(bookData)
      if (response.success) {
        alert("Book added successfully!")
        setIsAddDialogOpen(false)
        fetchBooks() // Refresh the list
        e.currentTarget.reset()
      }
    } catch (error: any) {
      alert("Failed to add book: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredBooks = allBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)

    const matchesCategory =
      categoryFilter === "all" || book.category === categoryFilter

    const matchesStatus =
      statusFilter === "all" || book.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = [...new Set(allBooks.map((book) => book.category))]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book Management"
        description="Manage your library book inventory"
      >
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Book</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleAddBook}>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter book title"
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author" className="text-foreground">
                  Author
                </Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn" className="text-foreground">
                  ISBN
                </Label>
                <Input
                  id="isbn"
                  name="isbn"
                  placeholder="Enter ISBN"
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">
                  Category
                </Label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Enter category"
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-border text-foreground"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Book"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-3">
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
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable books={filteredBooks} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredBooks.length} of {allBooks.length} books
        </p>
      </div>
    </div>
  )
}
