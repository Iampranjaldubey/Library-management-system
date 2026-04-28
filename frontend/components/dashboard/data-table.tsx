"use client"

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
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
}

export function DataTable({ books }: DataTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Title</TableHead>
            <TableHead className="text-muted-foreground">Author</TableHead>
            <TableHead className="text-muted-foreground">ISBN</TableHead>
            <TableHead className="text-muted-foreground">Category</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Copies</TableHead>
            <TableHead className="text-right text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id} className="border-border">
              <TableCell className="font-medium text-foreground">
                {book.title}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {book.author}
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {book.isbn}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {book.category}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    book.status === "available"
                      ? "default"
                      : book.status === "issued"
                      ? "secondary"
                      : "outline"
                  }
                  className={
                    book.status === "available"
                      ? "bg-primary/20 text-primary border-primary/30"
                      : book.status === "issued"
                      ? "bg-chart-5/20 text-chart-5 border-chart-5/30"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {book.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {book.copies}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem className="gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
