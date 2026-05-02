// API Response wrapper from backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Remove duplicate books from an array, preferring the first occurrence.
 *  Deduplicates by `id` first, then falls back to `isbn` for safety. */
export function dedupeBooks<T extends { id: string | number; isbn?: string }>(books: T[]): T[] {
  const seenIds = new Set<string>()
  const seenIsbns = new Set<string>()
  return books.filter((book) => {
    const id = String(book.id)
    const isbn = book.isbn?.trim().toLowerCase()

    if (seenIds.has(id)) return false
    if (isbn && isbn !== "n/a" && seenIsbns.has(isbn)) return false

    seenIds.add(id)
    if (isbn && isbn !== "n/a") seenIsbns.add(isbn)
    return true
  })
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const url = `${baseUrl}${endpoint}`;
  
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }
        throw new Error("Session expired. Please login again.");
      }

      // Try to get error message from response
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // Network error or other fetch errors
    if (error.message === "Session expired. Please login again.") {
      throw error;
    }
    
    console.error("API Fetch Error:", error);
    throw new Error(error.message || "Network error. Please check your connection.");
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiFetch<{
      token: string;
      type: string;
      id: number;
      name: string;
      email: string;
      role: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  
  register: async (name: string, email: string, password: string, role: string) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },
};

// Books API
export const booksApi = {
  getAll: async (available?: boolean) => {
    const query = available !== undefined ? `?available=${available}` : '';
    return apiFetch<Array<{
      id: number;
      title: string;
      author: string;
      isbn: string;
      category: string;
      available: boolean;
    }>>(`/books${query}`);
  },
  
  getById: async (id: number) => {
    return apiFetch(`/books/${id}`);
  },
  
  add: async (book: { title: string; author: string; isbn: string; category: string }) => {
    return apiFetch('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  },
};

// Transactions API
export const transactionsApi = {
  issue: async (bookId: number, userId: number) => {
    return apiFetch<{
      id: number;
      bookId: number;
      bookTitle: string;
      userId: number;
      userName: string;
      issueDate: string;
      dueDate: string;
      returnDate: string | null;
      fine: number | null;
    }>('/issue', {
      method: 'POST',
      body: JSON.stringify({ bookId, userId }),
    });
  },
  
  return: async (transactionId: number) => {
    return apiFetch('/return', {
      method: 'POST',
      body: JSON.stringify({ transactionId }),
    });
  },
  
  getAll: async () => {
    return apiFetch<Array<{
      id: number;
      bookId: number;
      bookTitle: string;
      userId: number;
      userName: string;
      issueDate: string;
      dueDate: string;
      returnDate: string | null;
      fine: number | null;
    }>>('/transactions');
  },
  
  getByUser: async (userId: number) => {
    return apiFetch(`/transactions/user/${userId}`);
  },
};
