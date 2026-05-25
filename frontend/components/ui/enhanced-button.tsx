"use client"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { components, animations } from "@/lib/design-system"
import { tapScale } from "@/lib/animations"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon"
  asChild?: boolean
  loading?: boolean
  animate?: boolean
  ripple?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Enhanced button component with consistent styling, animations, and ripple effect.
 * Extends shadcn/ui Button with additional features from the design system.
 */
export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    asChild = false, 
    loading = false,
    animate = true,
    ripple = false,
    disabled,
    children,
    onClick,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Get size classes from design system
    const sizeClasses = size === "icon" 
      ? components.button.iconSizes.md 
      : components.button.sizes[size] || components.button.sizes.md
    
    // Base button classes (using shadcn/ui variants)
    const baseClasses = cn(
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
        "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === "destructive",
        "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
        "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80": variant === "secondary",
        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
        "text-primary underline-offset-4 hover:underline": variant === "link",
      },
      sizeClasses,
      animations.transition.colors,
      className
    )

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return
      
      // Add ripple effect
      if (ripple) {
        const button = e.currentTarget
        const rect = button.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        
        const rippleElement = document.createElement("span")
        rippleElement.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.3;
          pointer-events: none;
          transform: scale(0);
          animation: ripple 0.6s linear;
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
        `
        
        button.appendChild(rippleElement)
        setTimeout(() => rippleElement.remove(), 600)
      }
      
      onClick?.(e)
    }

    if (animate) {
      return (
        <motion.div whileTap={tapScale} className="inline-flex">
          <Comp
            className={baseClasses}
            ref={ref}
            disabled={disabled || loading}
            onClick={handleClick}
            style={{ position: ripple ? "relative" : undefined, overflow: ripple ? "hidden" : undefined }}
            {...props}
          >
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
          </Comp>
        </motion.div>
      )
    }

    return (
      <Comp
        className={baseClasses}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        style={{ position: ripple ? "relative" : undefined, overflow: ripple ? "hidden" : undefined }}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </Comp>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

// ─── CSS for ripple animation ─────────────────────────────────────────────────

if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
}