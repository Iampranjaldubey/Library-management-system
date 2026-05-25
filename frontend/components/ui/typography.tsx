"use client"

import { cn } from "@/lib/utils"
import { typography } from "@/lib/design-system"

// ─── Display Text ─────────────────────────────────────────────────────────────

interface DisplayProps {
  children: React.ReactNode
  size?: "large" | "medium" | "small"
  className?: string
  as?: "h1" | "h2" | "h3" | "div"
}

export function Display({ children, size = "medium", className, as: Component = "h1" }: DisplayProps) {
  return (
    <Component className={cn(typography.display[size], className)}>
      {children}
    </Component>
  )
}

// ─── Headings ─────────────────────────────────────────────────────────────────

interface HeadingProps {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div"
}

export function Heading({ children, level = 1, className, as }: HeadingProps) {
  const Component = as || (`h${level}` as const)
  const headingKey = `h${level}` as keyof typeof typography.heading
  
  return (
    <Component className={cn(typography.heading[headingKey], className)}>
      {children}
    </Component>
  )
}

// ─── Body Text ────────────────────────────────────────────────────────────────

interface BodyProps {
  children: React.ReactNode
  size?: "large" | "medium" | "small"
  className?: string
  as?: "p" | "div" | "span"
}

export function Body({ children, size = "medium", className, as: Component = "p" }: BodyProps) {
  return (
    <Component className={cn(typography.body[size], "text-foreground", className)}>
      {children}
    </Component>
  )
}

// ─── Muted Text ───────────────────────────────────────────────────────────────

interface MutedProps {
  children: React.ReactNode
  size?: "large" | "medium" | "small"
  className?: string
  as?: "p" | "div" | "span"
}

export function Muted({ children, size = "medium", className, as: Component = "p" }: MutedProps) {
  return (
    <Component className={cn(typography.body[size], "text-muted-foreground", className)}>
      {children}
    </Component>
  )
}

// ─── Labels ───────────────────────────────────────────────────────────────────

interface LabelProps {
  children: React.ReactNode
  size?: "large" | "medium" | "small"
  className?: string
  as?: "label" | "span" | "div"
}

export function Label({ children, size = "medium", className, as: Component = "label" }: LabelProps) {
  return (
    <Component className={cn(typography.label[size], "text-foreground", className)}>
      {children}
    </Component>
  )
}

// ─── Code ─────────────────────────────────────────────────────────────────────

interface CodeProps {
  children: React.ReactNode
  block?: boolean
  className?: string
}

export function Code({ children, block = false, className }: CodeProps) {
  if (block) {
    return (
      <pre className={cn(typography.code.block, className)}>
        <code>{children}</code>
      </pre>
    )
  }
  
  return (
    <code className={cn(typography.code.inline, className)}>
      {children}
    </code>
  )
}

// ─── Page Title ───────────────────────────────────────────────────────────────

interface PageTitleProps {
  children: React.ReactNode
  description?: string
  className?: string
}

export function PageTitle({ children, description, className }: PageTitleProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Heading level={1} className="text-foreground">
        {children}
      </Heading>
      {description && (
        <Muted size="large">
          {description}
        </Muted>
      )}
    </div>
  )
}

// ─── Section Title ────────────────────────────────────────────────────────────

interface SectionTitleProps {
  children: React.ReactNode
  description?: string
  className?: string
}

export function SectionTitle({ children, description, className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Heading level={2} className="text-foreground">
        {children}
      </Heading>
      {description && (
        <Muted>
          {description}
        </Muted>
      )}
    </div>
  )
}

// ─── Card Title ───────────────────────────────────────────────────────────────

interface CardTitleProps {
  children: React.ReactNode
  description?: string
  className?: string
}

export function CardTitle({ children, description, className }: CardTitleProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Heading level={3} className="text-foreground">
        {children}
      </Heading>
      {description && (
        <Muted size="small">
          {description}
        </Muted>
      )}
    </div>
  )
}

// ─── List ─────────────────────────────────────────────────────────────────────

interface ListProps {
  children: React.ReactNode
  ordered?: boolean
  className?: string
}

export function List({ children, ordered = false, className }: ListProps) {
  const Component = ordered ? "ol" : "ul"
  
  return (
    <Component className={cn(
      "space-y-1 text-sm leading-relaxed text-foreground",
      ordered ? "list-decimal list-inside" : "list-disc list-inside",
      className
    )}>
      {children}
    </Component>
  )
}

interface ListItemProps {
  children: React.ReactNode
  className?: string
}

export function ListItem({ children, className }: ListItemProps) {
  return (
    <li className={cn("text-sm leading-relaxed", className)}>
      {children}
    </li>
  )
}

// ─── Blockquote ───────────────────────────────────────────────────────────────

interface BlockquoteProps {
  children: React.ReactNode
  author?: string
  className?: string
}

export function Blockquote({ children, author, className }: BlockquoteProps) {
  return (
    <blockquote className={cn(
      "border-l-4 border-primary/20 pl-4 italic text-muted-foreground",
      className
    )}>
      <Body>{children}</Body>
      {author && (
        <footer className="mt-2 text-xs text-muted-foreground">
          — {author}
        </footer>
      )}
    </blockquote>
  )
}

// ─── Link ─────────────────────────────────────────────────────────────────────

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
  variant?: "default" | "muted" | "primary"
  className?: string
}

export function Link({ children, variant = "default", className, ...props }: LinkProps) {
  const variantClasses = {
    default: "text-primary hover:text-primary/80 underline underline-offset-4",
    muted: "text-muted-foreground hover:text-foreground underline underline-offset-4",
    primary: "text-primary hover:text-primary/80 font-medium underline underline-offset-4",
  }
  
  return (
    <a 
      className={cn(
        "transition-colors duration-200",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

// ─── Keyboard Shortcut ────────────────────────────────────────────────────────

interface KbdProps {
  children: React.ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd className={cn(
      "inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-xs font-medium text-muted-foreground",
      className
    )}>
      {children}
    </kbd>
  )
}