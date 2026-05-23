import { LayoutDashboard, BookOpen, BookPlus, RotateCcw, ArrowLeftRight } from "lucide-react"
import type { Role } from "@/lib/auth"

export interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  /** Roles that can see this item. Undefined = all authenticated roles. */
  allowedRoles?: Role[]
}

export const navigation: NavItem[] = [
  { name: "Dashboard",    href: "/dashboard",              icon: LayoutDashboard },
  { name: "Books",        href: "/dashboard/books",        icon: BookOpen },
  { name: "Issue Book",   href: "/dashboard/issue",        icon: BookPlus,        allowedRoles: ["ADMIN", "LIBRARIAN"] },
  { name: "Return Book",  href: "/dashboard/return",       icon: RotateCcw,       allowedRoles: ["ADMIN", "LIBRARIAN"] },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight,  allowedRoles: ["ADMIN", "LIBRARIAN"] },
]
