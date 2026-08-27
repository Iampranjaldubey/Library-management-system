"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService, AuthError } from "@/lib/auth"
import { FormField } from "@/components/auth/form-field"
import { PasswordInput } from "@/components/auth/password-input"
import { LoadingButton } from "@/components/ui/button-loader"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const schema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordForm = z.infer<typeof schema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  if (!token) {
    return (
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Invalid Reset Link</h2>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block font-medium text-primary hover:text-primary/80 transition-colors text-sm"
        >
          Request a new reset link →
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10"
          >
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Password reset!</h2>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block font-medium text-primary hover:text-primary/80 transition-colors text-sm"
        >
          Sign in →
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError(null)
    try {
      await authService.resetPassword(token, data.newPassword)
      setSuccess(true)
      toast.success("Password reset successful!")
    } catch (err) {
      if (err instanceof AuthError) {
        setServerError(err.message)
        toast.error("Reset failed", { description: err.message })
      } else {
        setServerError("Something went wrong. Please try again.")
        toast.error("Reset failed")
      }
    }
  }

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Set new password</h2>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive leading-snug">{serverError}</p>
          </motion.div>
        )}

        <FormField id="newPassword" label="New password" error={errors.newPassword?.message}>
          <PasswordInput
            id="newPassword"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            autoFocus
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
        </FormField>

        <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
          <PasswordInput
            id="confirmPassword"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </FormField>

        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Resetting…"
          showProgress
          className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Reset password
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          ← Back to sign in
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-center p-8">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
