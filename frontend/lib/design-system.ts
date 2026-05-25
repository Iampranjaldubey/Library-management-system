/**
 * Centralized design system for consistent UI/UX across the application.
 * Defines typography, spacing, colors, shadows, and component variants.
 */

// ─── Typography Scale ─────────────────────────────────────────────────────────

export const typography = {
  // Display text (hero sections, large headings)
  display: {
    large: "text-4xl font-bold tracking-tight",
    medium: "text-3xl font-bold tracking-tight", 
    small: "text-2xl font-bold tracking-tight",
  },
  
  // Headings (page titles, section headers)
  heading: {
    h1: "text-2xl font-semibold tracking-tight",
    h2: "text-xl font-semibold tracking-tight",
    h3: "text-lg font-semibold tracking-tight",
    h4: "text-base font-semibold tracking-tight",
    h5: "text-sm font-semibold tracking-tight",
    h6: "text-xs font-semibold tracking-tight uppercase",
  },
  
  // Body text
  body: {
    large: "text-base leading-relaxed",
    medium: "text-sm leading-relaxed",
    small: "text-xs leading-relaxed",
  },
  
  // Labels and captions
  label: {
    large: "text-sm font-medium",
    medium: "text-xs font-medium",
    small: "text-xs font-medium uppercase tracking-wide",
  },
  
  // Code and monospace
  code: {
    inline: "font-mono text-sm bg-muted px-1.5 py-0.5 rounded",
    block: "font-mono text-sm bg-muted p-3 rounded-lg",
  },
}

// ─── Spacing Scale ────────────────────────────────────────────────────────────

export const spacing = {
  // Component internal spacing
  component: {
    xs: "p-2",      // 8px
    sm: "p-3",      // 12px  
    md: "p-4",      // 16px
    lg: "p-6",      // 24px
    xl: "p-8",      // 32px
  },
  
  // Layout spacing (between sections)
  layout: {
    xs: "space-y-2",   // 8px
    sm: "space-y-3",   // 12px
    md: "space-y-4",   // 16px
    lg: "space-y-6",   // 24px
    xl: "space-y-8",   // 32px
    "2xl": "space-y-12", // 48px
  },
  
  // Gap spacing (flex/grid gaps)
  gap: {
    xs: "gap-1",    // 4px
    sm: "gap-2",    // 8px
    md: "gap-3",    // 12px
    lg: "gap-4",    // 16px
    xl: "gap-6",    // 24px
  },
  
  // Margin utilities
  margin: {
    xs: "m-2",
    sm: "m-3", 
    md: "m-4",
    lg: "m-6",
    xl: "m-8",
  },
}

// ─── Border Radius Scale ──────────────────────────────────────────────────────

export const radius = {
  none: "rounded-none",
  sm: "rounded-sm",      // 2px
  md: "rounded-md",      // 6px
  lg: "rounded-lg",      // 8px
  xl: "rounded-xl",      // 12px
  "2xl": "rounded-2xl",  // 16px
  "3xl": "rounded-3xl",  // 24px
  full: "rounded-full",
}

// ─── Shadow Scale ─────────────────────────────────────────────────────────────

export const shadows = {
  none: "shadow-none",
  sm: "shadow-sm",                    // Subtle shadow
  md: "shadow-md",                    // Default shadow
  lg: "shadow-lg",                    // Elevated shadow
  xl: "shadow-xl",                    // High elevation
  "2xl": "shadow-2xl",                // Maximum elevation
  inner: "shadow-inner",              // Inset shadow
  
  // Custom shadows for specific use cases
  card: "shadow-sm hover:shadow-md transition-shadow duration-200",
  modal: "shadow-2xl",
  dropdown: "shadow-lg",
  button: "shadow-sm hover:shadow-md transition-shadow duration-150",
}

// ─── Component Variants ───────────────────────────────────────────────────────

export const components = {
  // Card variants
  card: {
    base: "rounded-xl border border-border bg-card text-card-foreground",
    elevated: "rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200",
    glass: "rounded-xl border border-border bg-card/60 backdrop-blur-sm text-card-foreground",
    outline: "rounded-xl border-2 border-dashed border-border/60 bg-transparent",
  },
  
  // Button variants (extending shadcn/ui)
  button: {
    // Size variants
    sizes: {
      xs: "h-7 px-2 text-xs",
      sm: "h-8 px-3 text-xs", 
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-6 text-sm",
      xl: "h-11 px-8 text-base",
    },
    
    // Icon button sizes
    iconSizes: {
      xs: "h-7 w-7",
      sm: "h-8 w-8",
      md: "h-9 w-9", 
      lg: "h-10 w-10",
      xl: "h-11 w-11",
    },
  },
  
  // Input variants
  input: {
    base: "flex h-9 w-full rounded-lg border border-border bg-input px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    large: "flex h-10 w-full rounded-lg border border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    small: "flex h-8 w-full rounded-md border border-border bg-input px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  },
  
  // Badge variants
  badge: {
    base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    sizes: {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-0.5 text-xs", 
      lg: "px-3 py-1 text-sm",
    },
  },
  
  // Modal variants
  modal: {
    backdrop: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
    content: "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl",
    contentLarge: "fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl",
    contentSmall: "fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border bg-card p-6 shadow-2xl",
  },
  
  // Table variants
  table: {
    container: "rounded-xl border border-border bg-card overflow-hidden",
    header: "border-b border-border bg-muted/20",
    row: "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
    cell: "px-4 py-3 text-sm",
    headerCell: "px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide",
  },
  
  // Form variants
  form: {
    group: "space-y-2",
    label: "text-sm font-medium text-foreground",
    description: "text-xs text-muted-foreground",
    error: "text-xs text-destructive",
    fieldset: "space-y-4",
    section: "space-y-6",
  },
}

// ─── Layout Patterns ──────────────────────────────────────────────────────────

export const layouts = {
  // Page layouts
  page: {
    container: "min-h-screen bg-background",
    content: "container mx-auto px-4 py-6 space-y-6",
    contentWide: "container mx-auto px-6 py-8 space-y-8",
    contentNarrow: "max-w-2xl mx-auto px-4 py-6 space-y-6",
  },
  
  // Dashboard layouts
  dashboard: {
    sidebar: "w-64 border-r border-border bg-card/50 backdrop-blur-sm",
    main: "flex-1 overflow-auto",
    header: "border-b border-border bg-card/50 backdrop-blur-sm px-6 py-4",
    content: "p-6 space-y-6",
  },
  
  // Grid layouts
  grid: {
    cards2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
    cards3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", 
    cards4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
    stats: "grid grid-cols-2 sm:grid-cols-4 gap-3",
    dashboard: "grid grid-cols-1 lg:grid-cols-3 gap-6",
  },
  
  // Flex layouts
  flex: {
    between: "flex items-center justify-between",
    center: "flex items-center justify-center",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    colCenter: "flex flex-col items-center justify-center",
  },
}

// ─── Animation Presets ────────────────────────────────────────────────────────

export const animations = {
  // Hover effects
  hover: {
    lift: "hover:-translate-y-0.5 transition-transform duration-200",
    scale: "hover:scale-[1.02] transition-transform duration-200",
    glow: "hover:shadow-lg hover:shadow-primary/20 transition-shadow duration-200",
  },
  
  // Loading states
  loading: {
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
  },
  
  // Transitions
  transition: {
    fast: "transition-all duration-150",
    normal: "transition-all duration-200", 
    slow: "transition-all duration-300",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200",
    shadow: "transition-shadow duration-200",
  },
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Combine multiple class strings with proper spacing
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

/**
 * Get responsive breakpoint classes
 */
export const breakpoints = {
  sm: "sm:",   // 640px
  md: "md:",   // 768px  
  lg: "lg:",   // 1024px
  xl: "xl:",   // 1280px
  "2xl": "2xl:", // 1536px
}

/**
 * Color palette helpers (for custom colors)
 */
export const colors = {
  // Status colors
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400", 
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  
  // Background variants
  successBg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/30",
  warningBg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30",
  errorBg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30", 
  infoBg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30",
}

// ─── Export All ───────────────────────────────────────────────────────────────

export const designSystem = {
  typography,
  spacing,
  radius,
  shadows,
  components,
  layouts,
  animations,
  colors,
  breakpoints,
}

export default designSystem