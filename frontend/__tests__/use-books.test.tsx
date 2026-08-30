import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"

// Keep toast side-effects quiet and inspectable.
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

// Stub only the network call; keep the real dedupeBooks/ApiError from the module.
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>()
  return { ...actual, booksApi: { ...actual.booksApi, getAll: vi.fn() } }
})

import { booksApi } from "@/lib/api"
import { useBooks } from "@/hooks/use-books"

const sample = [
  { id: 1, title: "Clean Code", author: "Martin", isbn: "A1", category: "Tech", available: true },
  { id: 2, title: "Refactoring", author: "Fowler", isbn: "A2", category: "Tech", available: false },
  { id: 3, title: "Sapiens", author: "Harari", isbn: "A3", category: "History", available: true },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useBooks", () => {
  it("loads, maps, and derives categories from the API response", async () => {
    ;(booksApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ data: sample })

    const { result } = renderHook(() => useBooks())
    await act(async () => {
      await result.current.fetchBooks()
    })

    expect(result.current.allBooks).toHaveLength(3)
    expect(result.current.categories).toEqual(["History", "Tech"])
    expect(result.current.error).toBeNull()
  })

  it("filters by a free-text search query", async () => {
    ;(booksApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ data: sample })

    const { result } = renderHook(() => useBooks())
    await act(async () => {
      await result.current.fetchBooks()
    })

    act(() => result.current.setSearch("fowler"))

    await waitFor(() => expect(result.current.filtered).toHaveLength(1))
    expect(result.current.filtered[0].title).toBe("Refactoring")
  })

  it("filters by availability status", async () => {
    ;(booksApi.getAll as ReturnType<typeof vi.fn>).mockResolvedValue({ data: sample })

    const { result } = renderHook(() => useBooks())
    await act(async () => {
      await result.current.fetchBooks()
    })

    act(() => result.current.setStatusFilter("available"))

    await waitFor(() => expect(result.current.filtered).toHaveLength(2))
    expect(result.current.filtered.every((b) => b.available)).toBe(true)
  })
})
