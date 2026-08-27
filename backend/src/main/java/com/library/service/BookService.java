package com.library.service;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookService {
    BookResponse  addBook(BookRequest request);
    List<BookResponse> getAllBooks();
    List<BookResponse> getAvailableBooks();
    BookResponse  getBookById(Long id);

    // ── Paginated queries ─────────────────────────────────────────────────────
    PagedResponse<BookResponse> getAllBooks(Pageable pageable);
    PagedResponse<BookResponse> searchBooks(String query, Boolean available, Pageable pageable);
}

