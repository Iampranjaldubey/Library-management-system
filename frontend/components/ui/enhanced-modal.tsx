"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { components } from "@/lib/design-system"
import { modalBackdrop, modalContent } from "@/lib/animations"
import { Button } from "@/components/ui/button"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnhancedModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  size?: "small" | "medium" | "large"
  className?: string
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Enhanced modal component with consistent styling and smooth animations.
 * Uses the centralized design system and animation library.
 */
export function EnhancedModal({
  open,
  onClose,
  children,
  title,
  description,
  size = "medium",
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
}: EnhancedModalProps) {
  const contentClasses = {
    small: components.modal.contentSmall,
    medium: components.modal.content,
    large: components.modal.contentLarge,
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalBackdrop}
            initial="initial"
            animate="animate"
            exit="exit"
            className={components.modal.backdrop}
            onClick={handleBackdropClick}
          />
          
          {/* Content */}
          <motion.div
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(contentClasses[size], className)}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1.5">
                  {title && (
                    <h2 className="text-lg font-semibold text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                )}
              </div>
            )}
            
            {/* Body */}
            <div className="space-y-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Modal Header ─────────────────────────────────────────────────────────────

interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn("space-y-1.5 mb-6", className)}>
      {children}
    </div>
  )
}

// ─── Modal Title ──────────────────────────────────────────────────────────────

interface ModalTitleProps {
  children: React.ReactNode
  className?: string
}

export function ModalTitle({ children, className }: ModalTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h2>
  )
}

// ─── Modal Description ────────────────────────────────────────────────────────

interface ModalDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function ModalDescription({ children, className }: ModalDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

// ─── Modal Content ────────────────────────────────────────────────────────────

interface ModalContentProps {
  children: React.ReactNode
  className?: string
}

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}

// ─── Modal Footer ─────────────────────────────────────────────────────────────

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-6 border-t border-border", className)}>
      {children}
    </div>
  )
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────

interface ConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  isLoading?: boolean
}

export function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <EnhancedModal
      open={open}
      onClose={onClose}
      size="small"
      showCloseButton={false}
    >
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
        <ModalDescription>{description}</ModalDescription>
      </ModalHeader>
      
      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : confirmText}
        </Button>
      </ModalFooter>
    </EnhancedModal>
  )
}