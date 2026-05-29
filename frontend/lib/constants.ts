/**
 * Application Constants
 * 
 * Centralized constants used throughout the application
 */

// ─── User Roles ───────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: "ADMIN",
  LIBRARIAN: "LIBRARIAN",
  USER: "USER",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// ─── Transaction Status ───────────────────────────────────────────────────────

export const TRANSACTION_STATUS = {
  ACTIVE: "ACTIVE",
  RETURNED: "RETURNED",
  OVERDUE: "OVERDUE",
} as const

export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS]

// ─── Book Categories ──────────────────────────────────────────────────────────

export const BOOK_CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Self-Help",
  "Business",
  "Children",
  "Young Adult",
  "Mystery",
  "Thriller",
  "Romance",
  "Fantasy",
  "Science Fiction",
  "Horror",
  "Poetry",
  "Drama",
  "Comics",
  "Other",
] as const

// ─── Sort Options ─────────────────────────────────────────────────────────────

export const SORT_OPTIONS = {
  TITLE_ASC: { field: "title", direction: "asc", label: "Title (A-Z)" },
  TITLE_DESC: { field: "title", direction: "desc", label: "Title (Z-A)" },
  AUTHOR_ASC: { field: "author", direction: "asc", label: "Author (A-Z)" },
  AUTHOR_DESC: { field: "author", direction: "desc", label: "Author (Z-A)" },
  CATEGORY_ASC: { field: "category", direction: "asc", label: "Category (A-Z)" },
  DATE_ASC: { field: "createdAt", direction: "asc", label: "Oldest First" },
  DATE_DESC: { field: "createdAt", direction: "desc", label: "Newest First" },
} as const

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

// ─── Date Formats ─────────────────────────────────────────────────────────────

export const DATE_FORMATS = {
  SHORT: "MMM dd, yyyy",
  LONG: "MMMM dd, yyyy",
  FULL: "EEEE, MMMM dd, yyyy",
  TIME: "HH:mm",
  DATETIME: "MMM dd, yyyy HH:mm",
  ISO: "yyyy-MM-dd",
} as const

// ─── Validation Rules ─────────────────────────────────────────────────────────

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  BOOK: {
    TITLE_MAX_LENGTH: 200,
    AUTHOR_MAX_LENGTH: 100,
    ISBN_PATTERN: /^(?:\d{10}|\d{13})$/,
    CATEGORY_MAX_LENGTH: 50,
  },
} as const

// ─── UI Constants ─────────────────────────────────────────────────────────────

export const UI = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 200,
  SKELETON_COUNT: 12,
} as const

// ─── HTTP Status Codes ────────────────────────────────────────────────────────

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const

// ─── Error Messages ───────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  GENERIC_ERROR: "An unexpected error occurred. Please try again.",
} as const

// ─── Success Messages ─────────────────────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  LOGIN: "Welcome back!",
  LOGOUT: "You have been logged out successfully.",
  BOOK_ADDED: "Book added successfully.",
  BOOK_UPDATED: "Book updated successfully.",
  BOOK_DELETED: "Book deleted successfully.",
  BOOK_ISSUED: "Book issued successfully.",
  BOOK_RETURNED: "Book returned successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
} as const

// ─── Local Storage Keys ───────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  PREFERENCES: "preferences",
} as const

// ─── Query Keys (for React Query) ─────────────────────────────────────────────

export const QUERY_KEYS = {
  BOOKS: "books",
  BOOK: "book",
  TRANSACTIONS: "transactions",
  TRANSACTION: "transaction",
  USERS: "users",
  USER: "user",
  STATS: "stats",
} as const

// ─── Route Paths ──────────────────────────────────────────────────────────────

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

// ─── API Endpoints ────────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  BOOKS: {
    BASE: "/books",
    BY_ID: (id: number) => `/books/${id}`,
    SEARCH: "/books/search",
  },
  TRANSACTIONS: {
    BASE: "/transactions",
    BY_ID: (id: number) => `/transactions/${id}`,
    ISSUE: "/issue",
    RETURN: "/return",
    BY_USER: (userId: number) => `/transactions/user/${userId}`,
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id: number) => `/users/${id}`,
  },
} as const

// ─── Theme ────────────────────────────────────────────────────────────────────

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const

// ─── Z-Index Layers ───────────────────────────────────────────────────────────

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const

// ─── Animation Variants ───────────────────────────────────────────────────────

export const ANIMATION_VARIANTS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  SLIDE_DOWN: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  SCALE: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
} as const

// ─── File Upload ──────────────────────────────────────────────────────────────

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword"],
} as const

// ─── Regular Expressions ──────────────────────────────────────────────────────

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,50}$/,
  ISBN_10: /^\d{10}$/,
  ISBN_13: /^\d{13}$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
} as const
