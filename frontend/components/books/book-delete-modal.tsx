"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Loader2, AlertTriangle } from "lucide-react"
import type { BookItem } from "@/hooks/use-books"

interface BookDeleteModalProps {
  book: BookItem | null
  open: boolean
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function BookDeleteModal({
  book, open, isDeleting, onClose, onConfirm,
}: BookDeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="bg-card border-border max-w-sm p-0 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {/* Warning band */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <AlertDialogHeader className="space-y-0">
                  <AlertDialogTitle className="text-base font-bold text-foreground">
                    Delete book?
                  </AlertDialogTitle>
                </AlertDialogHeader>
              </div>

              <div className="px-6 py-4">
                <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove{" "}
                  <span className="font-semibold text-foreground">
                    &ldquo;{book?.title}&rdquo;
                  </span>{" "}
                  from the catalogue. This action cannot be undone.
                </AlertDialogDescription>
              </div>

              <AlertDialogFooter className="px-6 py-4 border-t border-border bg-muted/20 flex-row justify-end gap-2">
                <AlertDialogCancel
                  className="border-border text-foreground h-9 px-4 text-sm"
                  disabled={isDeleting}
                  onClick={onClose}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 text-sm gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Deleting…
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </AlertDialogContent>
    </AlertDialog>
  )
}
