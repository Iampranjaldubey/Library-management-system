"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Edit, Trash2, MoreHorizontal, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { booksApi, ApiError } from "@/lib/api"

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  category: string
  status: "available" | "issued" | "reserved"
  copies: number
}

interface DataTableProps {
  books: Book[]
  onRefresh?: () => void
}

const statusConfig = {
  available: {
    label: "Available",
    className: "bg-primary/15 text-primary border-primary/20 hover:bg-primary/20",
  },
  issued: {
    label: "Issued",
    className: "bg-chart-5/15 text-chart-5 border-chart-5/20 hover:bg-chart-5/20",
  },
  reserved: {
    label: "Reserved",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function DataTable({ books, onRefresh }: DataTableProps) {
  const [editBook, setEditBook] = useState<Book | null>(null)
  const [deleteBook, setDeleteBook] = useState<Book | null>(null)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editBook) return
    setIsEditSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)
      await booksApi.update(Number(editBook.id), {
        title: fd.get("title") as string,
        author: fd.get("author") as string,
        isbn: fd.get("isbn") as string,
        category: fd.get("category") as string,
      })
      toast.success("Book updated successfully")
      setEditBook(null)
      onRefresh?.()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to update book"
      toast.error("Update failed", { description: msg })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteBook) return
    setIsDeleteSubmitting(true)
    try {
      await booksApi.delete(Number(deleteBook.id))
      toast.success(`"${deleteBook.title}" removed from catalogue`)
      setDeleteBook(null)
      onRefresh?.()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to delete book"
      toast.error("Delete failed", { description: msg })
    } finally {
      setIsDeleteSubmitting(false)
    }
  }

  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No books found</EmptyTitle>
            <EmptyDescription>
              No books match your current filters. Try adjusting your search or add a new book.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent bg-muted/20">
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Title</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Author</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide hidden md:table-cell">ISBN</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide hidden lg:table-cell">Category</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Status</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium text-xs uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => {
              const status = statusConfig[book.status] ?? statusConfig.reserved
              return (
                <TableRow key={book.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                    {book.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{book.author}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {book.isbn}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {book.category}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => setEditBook(book)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => setDeleteBook(book)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editBook} onOpenChange={(o) => !o && setEditBook(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Book</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the book details below.
            </DialogDescription>
          </DialogHeader>
          {editBook && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {(["title", "author", "isbn", "category"] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`edit-${field}`} className="capitalize text-foreground">
                    {field}
                  </Label>
                  <Input
                    id={`edit-${field}`}
                    name={field}
                    defaultValue={editBook[field]}
                    required
                    className="bg-input border-border text-foreground"
                  />
                </div>
              ))}
              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditBook(null)}
                  disabled={isEditSubmitting}
                  className="border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isEditSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteBook} onOpenChange={(o) => !o && setDeleteBook(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete book?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove{" "}
              <span className="font-medium text-foreground">"{deleteBook?.title}"</span> from the
              catalogue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground" disabled={isDeleteSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleteSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleteSubmitting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
