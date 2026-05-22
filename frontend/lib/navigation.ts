import { LayoutDashboard, BookOpen, BookPlus, RotateCcw, ArrowLeftRight } from "lucide-react"

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Books", href: "/dashboard/books", icon: BookOpen },
  { name: "Issue Book", href: "/dashboard/issue", icon: BookPlus },
  { name: "Return Book", href: "/dashboard/return", icon: RotateCcw },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
]
