/**
 * Application Configuration
 * 
 * Centralized configuration management for environment variables
 * and application settings.
 */

import type { EnvironmentConfig } from "@/types"

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ""): string {
  if (typeof window === "undefined") {
    // Server-side
    return process.env[key] || fallback
  }
  // Client-side (Next.js automatically exposes NEXT_PUBLIC_ vars)
  return process.env[key] || fallback
}

/**
 * Application Configuration Object
 */
export const config: EnvironmentConfig = {
  // API Configuration
  apiUrl: getEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:8080"),
  
  // Application Metadata
  appName: getEnvVar("NEXT_PUBLIC_APP_NAME", "Library Management System"),
  appVersion: getEnvVar("NEXT_PUBLIC_APP_VERSION", "1.0.0"),
  
  // Environment Flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
}

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
  },
  
  // Books
  books: {
    base: "/api/books",
    byId: (id: number) => `/api/books/${id}`,
    search: "/api/books/search",
    categories: "/api/books/categories",
  },
  
  // Transactions
  transactions: {
    base: "/api/transactions",
    byId: (id: number) => `/api/transactions/${id}`,
    issue: "/api/transactions/issue",
    return: "/api/transactions/return",
    overdue: "/api/transactions/overdue",
  },
  
  // Users
  users: {
    base: "/api/users",
    byId: (id: number) => `/api/users/${id}`,
    profile: "/api/users/profile",
  },
} as const

/**
 * Application Constants
 */
export const APP_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: "token",
    USER: "user",
    THEME: "theme",
  },
  
  // Date Formats
  DATE_FORMAT: "MMM dd, yyyy",
  DATETIME_FORMAT: "MMM dd, yyyy HH:mm",
  
  // Validation
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 50,
  MAX_TITLE_LENGTH: 200,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const

/**
 * Feature Flags
 * Toggle features on/off without code changes
 */
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: config.isProduction,
  ENABLE_ERROR_REPORTING: config.isProduction,
  ENABLE_DEBUG_LOGS: config.isDevelopment,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
} as const

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  UNAUTHORIZED: "/unauthorized",
  
  DASHBOARD: {
    HOME: "/dashboard",
    BOOKS: "/dashboard/books",
    ISSUE: "/dashboard/issue",
    RETURN: "/dashboard/return",
    TRANSACTIONS: "/dashboard/transactions",
  },
} as const

/**
 * Role-based Route Access
 */
export const ROUTE_PERMISSIONS = {
  [ROUTES.DASHBOARD.HOME]: ["ADMIN", "LIBRARIAN", "USER"],
  [ROUTES.DASHBOARD.BOOKS]: ["ADMIN", "LIBRARIAN", "USER"],
  [ROUTES.DASHBOARD.ISSUE]: ["ADMIN", "LIBRARIAN"],
  [ROUTES.DASHBOARD.RETURN]: ["ADMIN", "LIBRARIAN"],
  [ROUTES.DASHBOARD.TRANSACTIONS]: ["ADMIN", "LIBRARIAN"],
} as const

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  const requiredVars = [
    { key: "NEXT_PUBLIC_API_URL", value: config.apiUrl },
  ]
  
  const missing = requiredVars.filter(({ value }) => !value)
  
  if (missing.length > 0 && config.isDevelopment) {
    console.warn(
      "Missing required environment variables:",
      missing.map(({ key }) => key).join(", ")
    )
  }
}

// Validate on module load
if (typeof window !== "undefined") {
  validateConfig()
}

/**
 * Get full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${config.apiUrl}${endpoint}`
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature]
}

/**
 * Get storage key
 */
export function getStorageKey(key: keyof typeof APP_CONSTANTS.STORAGE_KEYS): string {
  return APP_CONSTANTS.STORAGE_KEYS[key]
}
