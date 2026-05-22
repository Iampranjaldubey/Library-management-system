import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}

/**
 * Wraps a label + input + error message into a consistent block.
 * Works with any input component passed as children.
 */
export function FormField({ id, label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium",
          error ? "text-destructive" : "text-foreground/80"
        )}
      >
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
