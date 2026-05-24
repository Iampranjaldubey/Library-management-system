"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search, ChevronDown, RotateCcw, X,
  AlertTriangle, BookOpen, Clock,
} from "lucide-react"
import { format, parseISO, differenceInCalendarDays } from "date-fns"
import type { ActiveTransaction } from "@/hooks/use-return-form"

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionSelectProps {
  transactions: ActiveTransaction[]
  value: string
  onChange: (id: string) => void
  error?: string
  disabled?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function overdueDays(dueDate: string): number {
  return Math.max(0, differenceInCalendarDays(new Date(), parseISO(dueDate)))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionSelect({
  transactions,
  value,
  onChange,
  error,
  disabled,
}: TransactionSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = transactions.find((t) => String(t.id) === value)

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
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const overdueCount = transactions.filter((t) => t.status === "OVERDUE").length

  const filtered = transactions.filter((t) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      t.bookTitle.toLowerCase().includes(q) ||
      t.userName.toLowerCase().includes(q)
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
      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left",
          "bg-card/50 backdrop-blur-sm transition-all duration-200",
          "focus:outline-none",
          open
            ? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/5"
            : "border-border hover:border-primary/30 hover:shadow-sm",
          error && "border-destructive/60 ring-2 ring-destructive/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {/* Left icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            selected?.status === "OVERDUE"
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-primary/10 border border-primary/20"
          )}
        >
          {selected?.status === "OVERDUE" ? (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          ) : (
            <RotateCcw className="h-4 w-4 text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">
                  {selected.bookTitle}
                </p>
                {selected.status === "OVERDUE" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/25 px-2 py-0.5 text-[10px] font-semibold text-destructive shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                    Overdue
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {selected.userName}
                <span className="mx-1.5 opacity-40">·</span>
                Due {format(parseISO(selected.dueDate), "MMM d, yyyy")}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">
                {transactions.length === 0
                  ? "No issued books to return"
                  : "Search and select an issued book…"}
              </p>
              {overdueCount > 0 && (
                <p className="text-xs text-destructive/70 mt-0.5">
                  {overdueCount} overdue book{overdueCount !== 1 ? "s" : ""} need attention
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right controls */}
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
                  handleClear()
                }
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-50 mt-2 w-full rounded-2xl border border-border",
              "bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/15",
              "overflow-hidden"
            )}
            role="listbox"
          >
            {/* Search bar */}
            <div className="p-2.5 border-b border-border/60 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title or member name…"
                  className="pl-8 h-8 text-sm bg-background/60 border-border/50 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20 rounded-lg"
                />
              </div>
            </div>

            {/* Overdue section header */}
            {!query && overdueCount > 0 && (
              <div className="px-3 pt-2.5 pb-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-destructive/70 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  Overdue ({overdueCount})
                </p>
              </div>
            )}

            {/* List */}
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2.5 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                    <RotateCcw className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {query ? "No results found" : "No issued books"}
                    </p>
                    {query && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        Try a different search term
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-1.5 space-y-0.5">
                  {filtered.map((tx, i) => {
                    const isOverdue = tx.status === "OVERDUE"
                    const days = isOverdue ? overdueDays(tx.dueDate) : 0
                    const isSelected = value === String(tx.id)

                    return (
                      <motion.button
                        key={tx.id}
                        type="button"
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025 }}
                        onClick={() => handleSelect(String(tx.id))}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left",
                          "transition-all duration-100",
                          isSelected
                            ? isOverdue
                              ? "bg-destructive/8 ring-1 ring-destructive/20"
                              : "bg-primary/8 ring-1 ring-primary/20"
                            : isOverdue
                            ? "hover:bg-destructive/5"
                            : "hover:bg-primary/5"
                        )}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {/* Status icon */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5",
                            isOverdue
                              ? "bg-destructive/10 border border-destructive/20"
                              : "bg-muted border border-border/50"
                          )}
                        >
                          {isOverdue ? (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {tx.bookTitle}
                            </p>
                            {isOverdue && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/20 px-1.5 py-0.5 text-[10px] font-semibold text-destructive shrink-0">
                                <span className="h-1 w-1 rounded-full bg-destructive" />
                                {days}d overdue
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-xs text-muted-foreground truncate">
                              {tx.userName}
                            </p>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground/60 shrink-0">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(tx.dueDate), "MMM d")}
                            </span>
                          </div>
                        </div>

                        {/* Selected dot */}
                        {isSelected && (
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0 mt-2",
                              isOverdue ? "bg-destructive" : "bg-primary"
                            )}
                          />
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
              <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                  {query && ` · filtered from ${transactions.length}`}
                </p>
                {overdueCount > 0 && !query && (
                  <span className="text-[11px] font-medium text-destructive">
                    {overdueCount} overdue
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-xs text-destructive flex items-center gap-1"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
