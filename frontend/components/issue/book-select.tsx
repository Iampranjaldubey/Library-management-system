"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { BookStatusBadge } from "@/components/books/book-status-badge"
import { Input } from "@/components/ui/input"
import { Search, ChevronDown, BookOpen, X } from "lucide-react"
import type { AvailableBook } from "@/hooks/use-issue-form"

interface BookSelectProps {
  books: AvailableBook[]
  value: string
  onChange: (id: string) => void
  error?: string
  disabled?: boolean
}

export function BookSelect({ books, value, onChange, error, disabled }: BookSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = books.find((b) => String(b.id) === value)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const filtered = books.filter((b) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    )
  })

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
    setQuery("")
  }

  const handleClear = () => {
    onChange("")
    setQuery("")
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left",
          "bg-card/50 backdrop-blur-sm transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          open
            ? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/5"
            : "border-border hover:border-border/80",
          error && "border-destructive/60 ring-2 ring-destructive/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          {selected ? (
            <div>
              <p className="text-sm font-medium text-foreground truncate">{selected.title}</p>
              <p className="text-xs text-muted-foreground truncate">{selected.author} · {selected.category}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {books.length === 0 ? "No books available" : "Search and select a book…"}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClear()
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange("")
                  setQuery("")
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Clear selection"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-2 w-full rounded-xl border border-border",
              "bg-card/95 backdrop-blur-xl shadow-xl shadow-black/10",
              "overflow-hidden"
            )}
            role="listbox"
          >
            {/* Search */}
            <div className="p-2 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, author, ISBN…"
                  className="pl-8 h-8 text-sm bg-muted/50 border-transparent focus-visible:border-primary/30 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    {query ? "No books match your search" : "No available books"}
                  </p>
                </div>
              ) : (
                filtered.map((book, i) => (
                  <motion.button
                    key={book.id}
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleSelect(String(book.id))}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2.5 text-left",
                      "hover:bg-primary/5 transition-colors duration-100",
                      value === String(book.id) && "bg-primary/8"
                    )}
                    role="option"
                    aria-selected={value === String(book.id)}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                        <BookStatusBadge available size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {book.author}
                        <span className="mx-1.5 opacity-40">·</span>
                        {book.category}
                        <span className="mx-1.5 opacity-40">·</span>
                        <span className="font-mono">{book.isbn}</span>
                      </p>
                    </div>
                    {value === String(book.id) && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer count */}
            {filtered.length > 0 && (
              <div className="px-3 py-2 border-t border-border/60 bg-muted/20">
                <p className="text-[11px] text-muted-foreground">
                  {filtered.length} book{filtered.length !== 1 ? "s" : ""} available
                  {query && ` · filtered from ${books.length}`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-destructive"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
