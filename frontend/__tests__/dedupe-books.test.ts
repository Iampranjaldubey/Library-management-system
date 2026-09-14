import { describe, it, expect } from "vitest"
import { dedupeBooks } from "@/lib/api"

describe("dedupeBooks", () => {
  it("drops entries with a duplicate id, keeping the first occurrence", () => {
    const result = dedupeBooks([
      { id: 1, isbn: "A" },
      { id: 1, isbn: "B" },
      { id: 2, isbn: "C" },
    ])
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.id)).toEqual([1, 2])
  })

  it("dedupes by isbn even when the ids differ", () => {
    const result = dedupeBooks([
      { id: 1, isbn: "978-1" },
      { id: 2, isbn: "978-1" },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it("treats 'N/A' isbns as distinct so real books are never collapsed", () => {
    const result = dedupeBooks([
      { id: 1, isbn: "N/A" },
      { id: 2, isbn: "N/A" },
    ])
    expect(result).toHaveLength(2)
  })
})
