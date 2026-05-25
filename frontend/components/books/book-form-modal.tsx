"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { modalContent, formContainer, formField, fieldError } from "@/lib/animations"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/button-loader"
import { BookPlus, BookOpen, AlertCircle } from "lucide-react"
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
      <DialogContent className="bg-card border-border w-full max-w-[calc(100vw-2rem)] sm:max-w-md p-0 overflow-hidden">
        <AnimatePresence>
          {open && (
            <motion.div
              variants={modalContent}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
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
                <motion.div
                  variants={formContainer}
                  initial="initial"
                  animate="animate"
                  className="px-5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5"
                >
                  {FIELDS.map(({ name, label, placeholder }) => (
                    <motion.div key={name} variants={formField} className="space-y-1.5">
                      <Label
                        htmlFor={`book-${name}`}
                        className={cn(
                          "text-sm font-medium transition-colors duration-150",
                          errors[name] ? "text-destructive" : "text-foreground/80"
                        )}
                      >
                        {label}
                        <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id={`book-${name}`}
                        placeholder={placeholder}
                        aria-invalid={!!errors[name]}
                        className={cn(
                          "bg-input/50 border-border text-foreground placeholder:text-muted-foreground/40",
                          "transition-all duration-150",
                          errors[name] && "border-destructive/60 focus-visible:ring-destructive/15"
                        )}
                        {...register(name)}
                      />
                      <AnimatePresence initial={false}>
                        {errors[name] && (
                          <motion.p
                            variants={fieldError}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="flex items-center gap-1.5 text-xs text-destructive overflow-hidden"
                            role="alert"
                          >
                            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                            {errors[name]?.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 border-t border-border bg-muted/20">
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
                  <LoadingButton
                    type="submit"
                    size="sm"
                    isLoading={isSubmitting}
                    loadingText={isEdit ? "Saving…" : "Adding…"}
                    showProgress
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[100px]"
                  >
                    {isEdit ? "Save changes" : "Add book"}
                  </LoadingButton>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
