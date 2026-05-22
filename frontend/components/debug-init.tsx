"use client"

import { useEffect } from "react"

/**
 * Loads the debug helper in development only.
 * Renders nothing — purely a side-effect component.
 * Tree-shaken out of production builds.
 */
export function DebugInit() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      import("@/lib/debug").catch(() => {
        // Non-critical — silently ignore if the module fails to load
      })
    }
  }, [])

  return null
}
