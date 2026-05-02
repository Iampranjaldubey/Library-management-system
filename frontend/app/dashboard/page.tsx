"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { booksApi, dedupeBooks } from "@/lib/api"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { DataTable, type Book } from "@/components/dashboard/data-table"
import { BookOpen, Users, BookCheck, Clock } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const [totalBooks, setTotalBooks] = useState<number>(0)
  const [issuedBooks, setIssuedBooks] = useState<number>(0)
  const [availableBooks, setAvailableBooks] = useState<number>(0)

  // Check if user is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/")
        return
      }
    }
  }, [router])

  // Fetch books from API
  useEffect(() => {
    booksApi.getAll()
      .then((response) => {
        const booksData = response.data
        const mappedBooks: Book[] = Array.isArray(booksData) ? booksData.map((b: any) => ({
          id: String(b.id),
          title: b.title || "Unknown",
          author: b.author || "Unknown",
          isbn: b.isbn || "N/A",
          category: b.category || "Uncategorized",
          status: b.available ? "available" : "issued",
          copies: 1,
        })) : []

        const unique = dedupeBooks(mappedBooks)

        setTotalBooks(unique.length)
        setIssuedBooks(unique.filter((b) => b.status === "issued").length)
        setAvailableBooks(unique.filter((b) => b.status === "available").length)
        setRecentBooks(unique.slice(0, 5))
      })
      .catch((error) => {
        console.error("Error fetching books:", error)
      })
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Overview of your library management system"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Books"
          value={totalBooks}
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
          value={issuedBooks}
          icon={BookCheck}
          trend={{ value: 5, isPositive: false }}
          description="from last month"
        />
        <StatsCard
          title="Available Books"
          value={availableBooks}
          icon={Clock}
          trend={{ value: 15, isPositive: true }}
          description="in catalogue"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Books</h2>
        <DataTable books={recentBooks} />
      </div>
    </div>
  )
}
