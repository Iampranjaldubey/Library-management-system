"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { authService, AuthError, type Role } from "@/lib/auth"
import { useAuth } from "@/context/auth-context"
import { FormField } from "@/components/auth/form-field"
import { PasswordInput } from "@/components/auth/password-input"
import { RoleSelector } from "@/components/auth/role-selector"
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
    role: z.enum(["ADMIN", "LIBRARIAN", "USER"] as const, {
      required_error: "Please select a role",
    }),
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
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "USER",
    },
  })

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null)
    try {
      const user = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role as Role,
      })
      login(user)
      toast.success("Account created!", {
        description: `Welcome to LibraryOS, ${user.name}`,
      })
      router.replace("/dashboard")
    } catch (err) {
      if (err instanceof AuthError) {
        // Map backend field-level validation errors onto the form
        if (err.fieldErrors) {
          const fieldMap: Record<string, keyof RegisterForm> = {
            name: "name",
            email: "email",
            password: "password",
            role: "role",
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

        {/* Role selector */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground/80">Account type</p>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <RoleSelector
                value={field.value as Role}
                onChange={field.onChange}
                error={errors.role?.message}
              />
            )}
          />
        </div>

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
