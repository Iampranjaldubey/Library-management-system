"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navigation } from "@/lib/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Library, LogOut, Menu, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import type { Role } from "@/lib/auth"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    setOpen(false)
    toast.success("Logged out successfully")
    logout()
  }

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "LO"

  // Filter nav items by the current user's role
  const visibleNav = navigation.filter((item) => {
    if (!item.allowedRoles) return true
    return user?.role && item.allowedRoles.includes(user.role as Role)
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50 lg:hidden h-9 w-9 rounded-lg bg-card border border-border shadow-sm"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-sidebar p-0 border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Library className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-base font-semibold text-sidebar-foreground tracking-tight">
              LibraryOS
            </span>
            <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest leading-none mt-0.5">
              Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 p-3">
          <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
            Menu
          </p>
          {visibleNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive
                      ? "text-primary"
                      : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground"
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-primary/60" />}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-3 space-y-1">
          {user && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/40 truncate capitalize">
                  {user.role?.toLowerCase()}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
