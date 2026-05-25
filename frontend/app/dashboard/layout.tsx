"use client"

import { Sidebar, MobileSidebar, useSidebarState } from "@/components/dashboard/sidebar"
import { TopNavbar } from "@/components/dashboard/top-navbar"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useThemePersistence } from "@/hooks/use-theme-persistence"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts()
  useThemePersistence()

  const [{ isCollapsed }] = useSidebarState()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile slide-out sidebar */}
      <MobileSidebar />

      {/* Main content — shifts right to clear the sidebar */}
      <div
        className={cn(
          "flex flex-col min-h-screen",
          "transition-[margin] duration-300 ease-in-out",
          "lg:ml-64",
          isCollapsed && "lg:ml-16",
        )}
      >
        <TopNavbar />
        <main className="flex-1 p-4 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
