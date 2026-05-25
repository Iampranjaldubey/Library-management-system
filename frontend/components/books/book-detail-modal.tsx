"use client"

import { motion, AnimatePresence } from "framer-motion"
import { modalContent } from "@/lib/animations"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookStatusBadge } from "./book-status-badge"
import { BookOpen, Hash, User, Tag, Edit } from "lucide-react"
import type { BookItem } from "@/hooks/use-books"

interface BookDetailModalProps {
  book: BookItem | null
  open: boolean
  canEdit: boolean
  onClose: () => void
  onEdit: (book: BookItem) => void
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60">{label}</p>
        <p className="text-sm font-medium text-foreground mt-0.5 break-words">{value}</p>
      </div>
    </div>
  )
}

export function BookDetailModal({ book, open, canEdit, onClose, onEdit }: BookDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border w-full max-w-[calc(100vw-2rem)] sm:max-w-md p-0 overflow-hidden">
        <AnimatePresence>
          {book && (
            <motion.div
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header band */}
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-border">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogHeader>
                      <DialogTitle className="text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                        {book.title}
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{book.author}</p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <BookStatusBadge available={book.available} />
                </div>
              </div>

              {/* Details */}
              <div className="px-5 sm:px-6 py-1 sm:py-2">
                <DetailRow icon={Hash} label="ISBN" value={book.isbn} />
                <DetailRow icon={Tag} label="Category" value={book.category} />
                <DetailRow icon={User} label="Author" value={book.author} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted/20">
                <Button variant="outline" size="sm" className="border-border" onClick={onClose}>
                  Close
                </Button>
                {canEdit && (
                  <Button
                    size="sm"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => { onClose(); onEdit(book) }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit book
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
