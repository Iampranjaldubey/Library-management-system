"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { booksApi, transactionsApi, dedupeBooks, ApiError, type BookDto, type TransactionDto } from "@/lib/api"
import { toast } from "sonner"
import { parseISO, format, addDays } from "date-fns"

// ─── Schema ───────────────────────────────────────────────────────────────────

export const issueSchema = z.object({
  bookId: z.string().min(1, "Please select a book"),
  userId: z
    .string()
    .min(1, "User ID is required")
    .regex(/^\d+$/, "User ID must be a positive number")
    .refine((v) => Number(v) > 0, "User ID must be greater than 0"),
})

export type IssueFormValues = z.infer<typeof issueSchema>

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvailableBook {
  id: number
  title: string
  author: string
  isbn: string
  category: string
}

export interface IssuedResult {
  bookTitle: string
  userName: string
  dueDate: string
  issueDate: string
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseIssueFormOptions {
  defaultUserId?: string
}

export function useIssueForm({ defaultUserId = "" }: UseIssueFormOptions = {}) {
  const [availableBooks, setAvailableBooks] = useState<AvailableBook[]>([])
  const [isBooksLoading, setIsBooksLoading] = useState(true)
  const [booksError, setBooksError] = useState<string | null>(null)
  const [issuedResult, setIssuedResult] = useState<IssuedResult | null>(null)

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: { bookId: "", userId: defaultUserId },
  })

  // Sync defaultUserId into the form when it becomes available
  useEffect(() => {
    if (defaultUserId && !form.getValues("userId")) {
      form.setValue("userId", defaultUserId, { shouldValidate: false })
    }
  }, [defaultUserId, form])

  // ── Fetch available books ──────────────────────────────────────────────────

  const fetchAvailableBooks = useCallback(async () => {
    setIsBooksLoading(true)
    setBooksError(null)
    try {
      const res = await booksApi.getAll(true)
      if (res.success && Array.isArray(res.data)) {
        const mapped: AvailableBook[] = res.data.map((b: BookDto) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          category: b.category || "Uncategorized",
        }))
        setAvailableBooks(dedupeBooks(mapped))
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : String(err)
      setBooksError(msg)
      toast.error("Failed to load available books", { description: msg })
    } finally {
      setIsBooksLoading(false)
    }
  }, [])

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (values: IssueFormValues) => {
    try {
      const res = await transactionsApi.issue(Number(values.bookId), Number(values.userId))
      if (res.success) {
        const tx: TransactionDto = res.data
        const result: IssuedResult = {
          bookTitle: tx.bookTitle,
          userName: tx.userName,
          dueDate: format(parseISO(tx.dueDate), "PPP"),
          issueDate: format(parseISO(tx.issueDate), "PPP"),
        }
        setIssuedResult(result)
        toast.success("Book issued successfully", {
          description: `Due back by ${result.dueDate}`,
        })
        // Refresh available books so the issued book disappears
        fetchAvailableBooks()
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const backendMsg: string =
          (err.body && typeof err.body === "object" && "message" in err.body
            ? String((err.body as { message: unknown }).message)
            : null) ?? err.message

        const lower = backendMsg.toLowerCase()

        if (err.status === 400 || err.status === 404) {
          // "User not found with id: X"
          if (lower.includes("user not found")) {
            form.setError("userId", {
              type: "server",
              message: "No user found with this ID. Check the ID and try again.",
            })
            return
          }
          // "Book 'X' is currently not available for issue"
          if (lower.includes("not available")) {
            form.setError("bookId", { type: "server", message: backendMsg })
            return
          }
          // "Book not found with id: X"
          if (lower.includes("book not found")) {
            form.setError("bookId", {
              type: "server",
              message: "Selected book no longer exists. Please refresh and try again.",
            })
            return
          }
        }

        // 403 — role check (shouldn't reach here but handle gracefully)
        if (err.status === 403) {
          toast.error("Permission denied", {
            description: "Only ADMIN and LIBRARIAN can issue books.",
          })
          return
        }

        // Generic backend error
        toast.error("Failed to issue book", { description: backendMsg })
      } else {
        toast.error("Failed to issue book", {
          description: "An unexpected error occurred. Please try again.",
        })
      }
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────

  const resetForm = (keepUserId = true) => {
    const currentUserId = form.getValues("userId")
    form.reset({
      bookId: "",
      userId: keepUserId ? currentUserId : defaultUserId,
    })
    setIssuedResult(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedBookId = form.watch("bookId")
  const selectedBook = availableBooks.find((b) => String(b.id) === selectedBookId) ?? null
  const previewDueDate = format(addDays(new Date(), 7), "PPP")
  const previewIssueDate = format(new Date(), "PPP")

  return {
    form,
    availableBooks,
    isBooksLoading,
    booksError,
    issuedResult,
    selectedBook,
    previewDueDate,
    previewIssueDate,
    fetchAvailableBooks,
    onSubmit: form.handleSubmit(onSubmit),
    resetForm,
  }
}
