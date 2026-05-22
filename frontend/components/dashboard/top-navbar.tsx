"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { navigation } from "@/lib/navigation"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Bell } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TopNavbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const currentPage = navigation.find((n) => n.href === pathname)
  const pageTitle = currentPage?.name ?? "Dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/80 backdrop-blur-md px-6">
      {/* Page breadcrumb — hidden on mobile (hamburger takes that space) */}
      <div className="hidden lg:flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">LibraryOS</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{pageTitle}</span>
      </div>

      {/* Spacer on mobile so actions stay right-aligned */}
      <div className="flex-1 lg:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
