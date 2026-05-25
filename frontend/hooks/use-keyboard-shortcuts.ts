"use client"

import { useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { canManageBooks, canManageTransactions } from "@/lib/permissions"

// ─── Types ────────────────────────────────────────────────────────────────────

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
  permission?: string
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { user } = useAuth()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "d",
      ctrl: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "b",
      ctrl: true,
      action: () => router.push("/dashboard/books"),
      description: "Go to Books",
    },
    {
      key: "i",
      ctrl: true,
      action: () => {
        if (canManageTransactions(user?.role)) {
          router.push("/dashboard/issue")
        }
      },
      description: "Go to Issue Book",
      permission: "transactions:issue",
    },
    {
      key: "r",
      ctrl: true,
      action: () => {
        if (canManageTransactions(user?.role)) {
          router.push("/dashboard/return")
        }
      },
      description: "Go to Return Book",
      permission: "transactions:return",
    },
    {
      key: "t",
      ctrl: true,
      action: () => {
        if (canManageTransactions(user?.role)) {
          router.push("/dashboard/transactions")
        }
      },
      description: "Go to Transactions",
      permission: "transactions:view-all",
    },
    // Actions
    {
      key: "k",
      ctrl: true,
      action: () => {
        // Focus search input if exists
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]')
        searchInput?.focus()
      },
      description: "Focus Search",
    },
    {
      key: "n",
      ctrl: true,
      action: () => {
        if (canManageBooks(user?.role)) {
          // Trigger add book action
          const addButton = document.querySelector<HTMLButtonElement>('[aria-label*="Add"], button:has(svg + *:contains("Add"))')
          addButton?.click()
        }
      },
      description: "Add New Book",
      permission: "books:create",
    },
    {
      key: "/",
      action: () => {
        // Focus search input
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]')
        searchInput?.focus()
      },
      description: "Focus Search",
    },
  ]

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow "/" to focus search even in inputs
        if (event.key !== "/") return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return { shortcuts }
}

// ─── Keyboard Shortcuts Help Component ───────────────────────────────────────

export function getKeyboardShortcuts(userRole?: string) {
  const shortcuts = [
    { keys: ["Ctrl", "D"], description: "Go to Dashboard", permission: null },
    { keys: ["Ctrl", "B"], description: "Go to Books", permission: null },
    { keys: ["Ctrl", "I"], description: "Go to Issue Book", permission: "transactions:issue" },
    { keys: ["Ctrl", "R"], description: "Go to Return Book", permission: "transactions:return" },
    { keys: ["Ctrl", "T"], description: "Go to Transactions", permission: "transactions:view-all" },
    { keys: ["Ctrl", "K"], description: "Focus Search", permission: null },
    { keys: ["Ctrl", "N"], description: "Add New Book", permission: "books:create" },
    { keys: ["/"], description: "Focus Search", permission: null },
  ]

  return shortcuts
}
