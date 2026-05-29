/**
 * Centralized Type Definitions
 * 
 * This file contains all shared TypeScript types and interfaces
 * used across the application.
 */

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface ApiError {
  message: string
  status: number
  body?: unknown
}

// ─── User & Authentication Types ──────────────────────────────────────────────

export type Role = "ADMIN" | "LIBRARIAN" | "USER"

export interface AuthUser {
  id: number
  username: string
  email: string
  role: Role
  fullName?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  fullName?: string
  role?: Role
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

// ─── Book Types ───────────────────────────────────────────────────────────────

export interface BookDto {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  available: boolean
  publishedYear?: number
  publisher?: string
  description?: string
  totalCopies?: number
  availableCopies?: number
  createdAt?: string
  updatedAt?: string
}

export interface BookItem {
  id: number
  title: string
  author: string
  isbn: string
  category: string
  available: boolean
}

export interface BookFormData {
  title: string
  author: string
  isbn: string
  category: string
  publishedYear?: number
  publisher?: string
  description?: string
  totalCopies?: number
}

export type SortField = "title" | "author" | "category" | "isbn"
export type SortDirection = "asc" | "desc"

// ─── Transaction Types ────────────────────────────────────────────────────────

export type TransactionStatus = "ISSUED" | "RETURNED" | "OVERDUE"

export interface TransactionDto {
  id: number
  bookId: number
  bookTitle: string
  userId: number
  username: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: TransactionStatus
  fine?: number
  notes?: string
}

export interface TransactionRow {
  id: number
  bookId: number
  bookTitle: string
  userId: number
  username: string
  issueDate: string
  dueDate: string
  returnDate?: string
  status: TransactionStatus
  fine?: number
}

export interface IssueBookRequest {
  bookId: number
  userId: number
  dueDate?: string
  notes?: string
}

export interface ReturnBookRequest {
  transactionId: number
  returnDate?: string
  condition?: string
  notes?: string
}

// ─── Filter & Pagination Types ────────────────────────────────────────────────

export interface PaginationState {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}

export interface FilterState {
  search: string
  category: string
  status: "all" | "available" | "issued"
}

export interface SortState {
  field: SortField
  direction: SortDirection
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface FormFieldError {
  message: string
  type: string
}

export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, FormFieldError>>
  isSubmitting: boolean
  isValid: boolean
}

// ─── UI Component Types ───────────────────────────────────────────────────────

export interface SelectOption {
  label: string
  value: string
}

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
}

// ─── Dashboard & Statistics Types ─────────────────────────────────────────────

export interface DashboardStats {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  totalUsers: number
  overdueTransactions: number
  recentTransactions: TransactionRow[]
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

// ─── Permission Types ─────────────────────────────────────────────────────────

export interface Permission {
  resource: string
  actions: ("create" | "read" | "update" | "delete")[]
}

export interface RolePermissions {
  role: Role
  permissions: Permission[]
}

// ─── Utility Types ────────────────────────────────────────────────────────────

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type AsyncState<T> = {
  data: Nullable<T>
  loading: boolean
  error: Nullable<string>
}

// ─── Hook Return Types ────────────────────────────────────────────────────────

export interface UseBooksReturn {
  allBooks: BookItem[]
  filteredBooks: BookItem[]
  paginatedBooks: BookItem[]
  isLoading: boolean
  error: string | null
  // Filters
  search: string
  setSearch: (search: string) => void
  categoryFilter: string
  setCategoryFilter: (category: string) => void
  statusFilter: "all" | "available" | "issued"
  setStatusFilter: (status: "all" | "available" | "issued") => void
  // Sorting
  sortField: SortField
  sortDir: SortDirection
  toggleSort: (field: SortField) => void
  // Pagination
  page: number
  setPage: (page: number) => void
  totalPages: number
  pageSize: number
  // Actions
  fetchBooks: () => Promise<void>
  refreshBooks: () => Promise<void>
}

export interface UseTransactionsReturn {
  transactions: TransactionRow[]
  filteredTransactions: TransactionRow[]
  paginatedTransactions: TransactionRow[]
  isLoading: boolean
  error: string | null
  // Filters
  search: string
  setSearch: (search: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  // Sorting
  sortField: string
  sortDir: SortDirection
  toggleSort: (field: string) => void
  // Pagination
  page: number
  setPage: (page: number) => void
  totalPages: number
  // Actions
  fetchTransactions: () => Promise<void>
  refreshTransactions: () => Promise<void>
}

// ─── Environment Variables ────────────────────────────────────────────────────

export interface EnvironmentConfig {
  apiUrl: string
  appName: string
  appVersion: string
  isDevelopment: boolean
  isProduction: boolean
}
