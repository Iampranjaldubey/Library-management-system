import { PageHeader } from "@/components/dashboard/page-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DataTable, type Book } from "@/components/dashboard/data-table"
import { BookOpen, Users, BookCheck, Clock } from "lucide-react"

const recentBooks: Book[] = [
  {
    id: "1",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Programming",
    status: "available",
    copies: 3,
  },
  {
    id: "2",
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    isbn: "978-0135957059",
    category: "Programming",
    status: "issued",
    copies: 2,
  },
  {
    id: "3",
    title: "Design Patterns",
    author: "Gang of Four",
    isbn: "978-0201633610",
    category: "Software Engineering",
    status: "available",
    copies: 4,
  },
  {
    id: "4",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "978-0735211292",
    category: "Self-Help",
    status: "reserved",
    copies: 1,
  },
  {
    id: "5",
    title: "System Design Interview",
    author: "Alex Xu",
    isbn: "978-1736049846",
    category: "Technology",
    status: "issued",
    copies: 2,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your library management system"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Books"
          value="2,847"
          icon={BookOpen}
          trend={{ value: 12, isPositive: true }}
          description="from last month"
        />
        <StatsCard
          title="Active Users"
          value="1,234"
          icon={Users}
          trend={{ value: 8, isPositive: true }}
          description="from last month"
        />
        <StatsCard
          title="Books Issued"
          value="456"
          icon={BookCheck}
          trend={{ value: 5, isPositive: false }}
          description="from last month"
        />
        <StatsCard
          title="Overdue Books"
          value="23"
          icon={Clock}
          trend={{ value: 15, isPositive: false }}
          description="needs attention"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Books</h2>
        <DataTable books={recentBooks} />
      </div>
    </div>
  )
}
