"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, BookPlus, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BookItem } from "@/hooks/use-books"

// ─── Schema ───────────────────────────────────────────────────────────────────

const bookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  author: z.string().min(1, "Author is required").max(100, "Author name is too long"),
  isbn: z
    .string()
    .min(1, "ISBN is required")
    .regex(/^[\d\-X ]+$/, "ISBN must contain only digits, hyphens, or X"),
  category: z.string().min(1, "Category is required").max(60, "Category is too long"),
})

export type BookFormValues = z.infer<typeof bookSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface BookFormModalProps {
  open: boolean
  mode: "add" | "edit"
  book?: BookItem | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (values: BookFormValues) => Promise<void>
}

// ─── Field config ─────────────────────────────────────────────────────────────

const FIELDS: {
  name: keyof BookFormValues
  label: string
  placeholder: string
  type?: string
}[] = [
  { name: "title", label: "Title", placeholder: "e.g. The Great Gatsby" },
  { name: "author", label: "Author", placeholder: "e.g. F. Scott Fitzgerald" },
  { name: "isbn", label: "ISBN", placeholder: "e.g. 978-3-16-148410-0" },
  { name: "category", label: "Category", placeholder: "e.g. Fiction" },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function BookFormModal({
  open, mode, book, isSubmitting, onClose, onSubmit,
}: BookFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: { title: "", author: "", isbn: "", category: "" },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        mode === "edit" && book
          ? { title: book.title, author: book.author, isbn: book.isbn, category: book.category }
          : { title: "", author: "", isbn: "", category: "" }
      )
    }
  }, [open, mode, book, reset])

  const isEdit = mode === "edit"
  const Icon = isEdit ? BookOpen : BookPlus

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md p-0 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold text-foreground">
                      {isEdit ? "Edit Book" : "Add New Book"}
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {isEdit
                      ? "Update the book details below."
                      : "Fill in the details to add a book to the catalogue."}
                  </DialogDescription>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="px-6 py-5 space-y-4">
                  {FIELDS.map(({ name, label, placeholder }) => (
                    <div key={name} className="space-y-1.5">
                      <Label
                        htmlFor={`book-${name}`}
                        className={cn(
                          "text-sm font-medium",
                          errors[name] ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {label}
                      </Label>
                      <Input
                        id={`book-${name}`}
                        placeholder={placeholder}
                        className={cn(
                          "bg-input border-border text-foreground placeholder:text-muted-foreground/50",
                          errors[name] && "border-destructive/60 focus-visible:ring-destructive/20"
                        )}
                        {...register(name)}
                      />
                      {errors[name] && (
                        <p className="text-xs text-destructive" role="alert">
                          {errors[name]?.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {isEdit ? "Saving…" : "Adding…"}
                      </>
                    ) : (
                      isEdit ? "Save changes" : "Add book"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
