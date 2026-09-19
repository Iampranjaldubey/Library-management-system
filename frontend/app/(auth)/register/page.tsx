"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService, AuthError } from "@/lib/auth"
import { useAuth } from "@/context/auth-context"
import { FormField } from "@/components/auth/form-field"
import { PasswordInput } from "@/components/auth/password-input"
import { RegisterFormSkeleton } from "@/components/auth/auth-form-skeleton"
import { LoadingButton } from "@/components/ui/button-loader"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

// ─── Validation schema ────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, authLoading, router])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null)
    try {
      // Role is no longer sent — backend defaults all public registrations to USER.
      // Only admins can promote users via the admin panel.
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      toast.success("Account created!", {
        description: "Please check your email for a verification link before signing in.",
        duration: 8000,
      })
      router.replace("/login")
    } catch (err) {
      if (err instanceof AuthError) {
        // Map backend field-level validation errors onto the form
        if (err.fieldErrors) {
          const fieldMap: Record<string, keyof RegisterForm> = {
            name: "name",
            email: "email",
            password: "password",
          }
          let hasFieldError = false
          Object.entries(err.fieldErrors).forEach(([field, message]) => {
            const formField = fieldMap[field]
            if (formField) {
              setError(formField, { type: "server", message })
              hasFieldError = true
            }
          })
          if (!hasFieldError) setServerError(err.message)
        } else if (err.status === 409) {
          // Duplicate email
          setError("email", {
            type: "server",
            message: "An account with this email already exists",
          })
        } else {
          setServerError(err.message)
        }
        toast.error("Registration failed", { description: err.message })
      } else {
        setServerError("Something went wrong. Please try again.")
        toast.error("Registration failed")
      }
    }
  }

  if (authLoading) return <RegisterFormSkeleton />

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create account</h2>
        <p className="text-sm text-muted-foreground">
          Fill in your details to get started with LibraryOS
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server-level error banner */}
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

        <FormField id="name" label="Full name" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            placeholder="Jane Smith"
            autoComplete="name"
            autoFocus
            aria-invalid={!!errors.name}
            className="bg-white/5 border-white/10 placeholder:text-muted-foreground/40 focus-visible:border-primary/50 focus-visible:ring-primary/15"
            {...register("name")}
          />
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@library.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="bg-white/5 border-white/10 placeholder:text-muted-foreground/40 focus-visible:border-primary/50 focus-visible:ring-primary/15"
            {...register("email")}
          />
        </FormField>

        <FormField id="password" label="Password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            placeholder="At least 6 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
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

        {/* Info note about role */}
        <p className="text-xs text-muted-foreground/70">
          All new accounts are created with Member access. Contact your library administrator for elevated privileges.
        </p>

        <LoadingButton
          type="submit"
          isLoading={isSubmitting}
          loadingText="Creating account…"
          showProgress
          className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Create account
        </LoadingButton>
      </form>

      {/* Divider */}
      <div className="relative pt-2 pb-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
        className="w-full flex items-center justify-center gap-3 h-10 rounded-md border border-input bg-background px-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 24 24" width="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
        Continue with Google
      </button>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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

