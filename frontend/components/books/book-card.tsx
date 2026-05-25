"use client"

import { motion } from "framer-motion"
import { cardEntrance, cardHover, cardTap } from "@/lib/animations"
import { BookStatusBadge } from "./book-status-badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookItem } from "@/hooks/use-books"

interface BookCardProps {
  book: BookItem
  index: number
  canEdit: boolean
  onView: (book: BookItem) => void
  onEdit: (book: BookItem) => void
  onDelete: (book: BookItem) => void
}

// Soft pastel accent per category (cycles through 6 colours)
const CATEGORY_ACCENTS = [
  "from-violet-500/10 to-violet-500/5 border-violet-500/15",
  "from-sky-500/10 to-sky-500/5 border-sky-500/15",
  "from-emerald-500/10 to-emerald-500/5 border-emerald-500/15",
  "from-amber-500/10 to-amber-500/5 border-amber-500/15",
  "from-rose-500/10 to-rose-500/5 border-rose-500/15",
  "from-indigo-500/10 to-indigo-500/5 border-indigo-500/15",
]

function categoryAccent(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = category.charCodeAt(i) + ((hash << 5) - hash)
  return CATEGORY_ACCENTS[Math.abs(hash) % CATEGORY_ACCENTS.length]
}

export function BookCard({ book, index, canEdit, onView, onEdit, onDelete }: BookCardProps) {
  const accent = categoryAccent(book.category)

  return (
    <motion.div
      variants={cardEntrance}
      initial="initial"
      animate="animate"
      whileHover={cardHover}
      whileTap={cardTap}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-gradient-to-br p-5 gap-4",
        "shadow-sm cursor-pointer",
        accent
      )}
    >
      {/* Icon + status */}
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/60 border border-border/50 backdrop-blur-sm">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <BookStatusBadge available={book.available} size="sm" />
      </div>

      {/* Title + author */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
      </div>

      {/* Meta */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground/60 uppercase tracking-wide font-medium">Category</span>
          <span className="text-muted-foreground font-medium truncate max-w-[120px]">{book.category}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground/60 uppercase tracking-wide font-medium">ISBN</span>
          <span className="font-mono text-muted-foreground">{book.isbn}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 flex-1 text-xs gap-1.5 text-muted-foreground hover:text-foreground active:scale-95"
          onClick={() => onView(book)}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        {canEdit && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 flex-1 text-xs gap-1.5 text-muted-foreground hover:text-foreground active:scale-95"
              onClick={() => onEdit(book)}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 flex-1 text-xs gap-1.5 text-muted-foreground hover:text-destructive active:scale-95"
              onClick={() => onDelete(book)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        )}
      </div>
    </motion.div>
  )
}
