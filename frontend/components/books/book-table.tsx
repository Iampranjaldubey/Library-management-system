"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookStatusBadge } from "./book-status-badge"
import {
  Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription,
} from "@/components/ui/empty"
import {
  Eye, Edit, Trash2, MoreHorizontal, BookOpen,
  ChevronUp, ChevronDown, ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookItem, SortField, SortDir } from "@/hooks/use-books"

interface BookTableProps {
  books: BookItem[]
  canEdit: boolean
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
  onView: (book: BookItem) => void
  onEdit: (book: BookItem) => void
  onDelete: (book: BookItem) => void
}

function SortIcon({ field, active, dir }: { field: string; active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-30" />
  return dir === "asc"
    ? <ChevronUp className="h-3 w-3 text-primary" />
    : <ChevronDown className="h-3 w-3 text-primary" />
}

const COLS: { key: SortField; label: string; className?: string }[] = [
  { key: "title", label: "Title" },
  { key: "author", label: "Author" },
  { key: "isbn", label: "ISBN", className: "hidden md:table-cell" },
  { key: "category", label: "Category", className: "hidden lg:table-cell" },
]

export function BookTable({
  books, canEdit, sortField, sortDir, onSort, onView, onEdit, onDelete,
}: BookTableProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card">
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookOpen /></EmptyMedia>
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
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent bg-muted/20">
            {COLS.map(({ key, label, className }) => (
              <TableHead key={key} className={cn("py-3", className)}>
                <button
                  onClick={() => onSort(key)}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                >
                  {label}
                  <SortIcon field={key} active={sortField === key} dir={sortDir} />
                </button>
              </TableHead>
            ))}
            <TableHead className="py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </span>
            </TableHead>
            <TableHead className="py-3 text-right">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {books.map((book, i) => (
              <motion.tr
                key={book.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, delay: i * 0.02 }}
                className="border-b border-border hover:bg-muted/30 transition-colors"
              >
                <TableCell className="font-medium text-foreground max-w-[200px]">
                  <span className="truncate block">{book.title}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{book.author}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell">
                  {book.isbn}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {book.category}
                </TableCell>
                <TableCell>
                  <BookStatusBadge available={book.available} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onView(book)}>
                        <Eye className="h-4 w-4" /> View details
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(book)}>
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => onDelete(book)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  )
}
