"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { navigation } from "@/lib/navigation"
import { useAuth } from "@/context/auth-context"
import { modalBackdrop, modalContent, staggerContainer, staggerItem } from "@/lib/animations"
import { Search, ArrowRight, Zap, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@/lib/auth"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  group: string
  keywords?: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const { user, logout } = useAuth()

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Close on escape
  useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  // Filter navigation by user role
  const visibleNav = navigation.filter((item) => {
    if (!item.allowedRoles) return true
    return user?.role && item.allowedRoles.includes(user.role as Role)
  })

  // Build command items
  const commands: CommandItem[] = [
    // Navigation items
    ...visibleNav.map((item) => ({
      id: `nav-${item.name}`,
      label: item.name,
      description: `Navigate to ${item.name}`,
      icon: item.icon as React.ComponentType<{ className?: string }>,
      action: () => {
        router.push(item.href)
        setOpen(false)
      },
      group: "Navigation",
      keywords: [item.name.toLowerCase(), "navigate", "go to"],
    })),

    // Quick actions
    {
      id: "search-books",
      label: "Search Books",
      description: "Find books in the catalogue",
      icon: Search as React.ComponentType<{ className?: string }>,
      action: () => {
        router.push("/dashboard/books")
        setOpen(false)
      },
      group: "Quick Actions",
      keywords: ["search", "find", "books", "catalogue"],
    },
    {
      id: "issue-book",
      label: "Issue Book",
      description: "Issue a book to a member",
      icon: ArrowRight as React.ComponentType<{ className?: string }>,
      action: () => {
        router.push("/dashboard/issue")
        setOpen(false)
      },
      group: "Quick Actions",
      keywords: ["issue", "lend", "checkout"],
    },
    {
      id: "return-book",
      label: "Return Book",
      description: "Process book returns",
      icon: ArrowRight as React.ComponentType<{ className?: string }>,
      action: () => {
        router.push("/dashboard/return")
        setOpen(false)
      },
      group: "Quick Actions",
      keywords: ["return", "checkin", "back"],
    },

    // System actions
    {
      id: "settings",
      label: "Settings",
      description: "Application settings",
      icon: Settings as React.ComponentType<{ className?: string }>,
      action: () => {
        // TODO: Navigate to settings when implemented
        setOpen(false)
      },
      group: "System",
      keywords: ["settings", "preferences", "config"],
    },
    {
      id: "logout",
      label: "Sign Out",
      description: "Sign out of your account",
      icon: LogOut as React.ComponentType<{ className?: string }>,
      action: () => {
        logout()
        setOpen(false)
      },
      group: "System",
      keywords: ["logout", "sign out", "exit"],
    },
  ]

  // Filter commands based on search
  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase()
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some(keyword => keyword.includes(searchLower))
    )
  })

  // Group filtered commands
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = []
    }
    acc[command.group].push(command)
    return acc
  }, {} as Record<string, CommandItem[]>)

  const runCommand = useCallback((command: CommandItem) => {
    command.action()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={modalContent}
        className="overflow-hidden"
      >
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
            />
            <div className="ml-auto flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found for "{search}"
            </CommandEmpty>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {Object.entries(groupedCommands).map(([group, items]) => (
                <CommandGroup key={group} heading={group}>
                  {items.map((command) => (
                    <motion.div key={command.id} variants={staggerItem}>
                      <CommandItem
                        onSelect={() => runCommand(command)}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent rounded-md transition-colors"
                      >
                        <command.icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{command.label}</div>
                          {command.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                      </CommandItem>
                    </motion.div>
                  ))}
                </CommandGroup>
              ))}
            </motion.div>
          </CommandList>
        </Command>
      </motion.div>
    </CommandDialog>
  )
}

// ─── Search Trigger Button ────────────────────────────────────────────────────

interface SearchTriggerProps {
  className?: string
}

export function SearchTrigger({ className }: SearchTriggerProps) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </motion.button>
      <CommandPalette />
    </>
  )
}