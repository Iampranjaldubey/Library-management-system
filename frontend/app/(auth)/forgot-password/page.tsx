"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService, AuthError } from "@/lib/auth"
import { FormField } from "@/components/auth/form-field"
import { LoadingButton } from "@/components/ui/button-loader"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Mail } from "lucide-react"

const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
})

type ForgotPasswordForm = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setServerError(null)
    try {
      await authService.forgotPassword(data.email)
      setSuccess(true)
      toast.success("Reset link sent", {
        description: "Check your email for a password reset link.",
      })
    } catch (err) {
      if (err instanceof AuthError) {
        setServerError(err.message)
      } else {
        setServerError("Something went wrong. Please try again.")
      }
    }
  }

  if (success) {
    return (
      <div className="space-y-7">
        <div className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
          >
            <Mail className="h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            If an account exists with that email, we&apos;ve sent a password reset link.
            It may take a minute to arrive.
          </p>
        </div>
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

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
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

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@library.com"
            autoComplete="email"
            autoFocus
            aria-invalid={!!errors.email}
            className="bg-white/5 border-white/10 placeholder:text-muted-foreground/40 focus-visible:border-primary/50 focus-visible:ring-primary/15"
            {...register("email")}
          />
        </FormField>

        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Sending…"
          showProgress
          className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Send reset link
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
