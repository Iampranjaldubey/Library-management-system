"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

/**
 * Ensures theme preference is persisted and applied immediately.
 * Prevents flash of wrong theme on page load.
 */
export function useThemePersistence() {
  const { theme, setTheme, systemTheme } = useTheme()

  useEffect(() => {
    // Apply theme immediately on mount
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme)
    }

    // Listen for theme changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue) {
        setTheme(e.newValue)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [theme, setTheme])

  // Sync theme to localStorage whenever it changes
  useEffect(() => {
    if (theme) {
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  return { theme, setTheme, systemTheme }
}
