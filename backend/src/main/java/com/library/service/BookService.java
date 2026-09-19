package com.library.service;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface BookService {
    BookResponse  addBook(BookRequest request);
    BookResponse  updateBook(Long id, BookRequest request);
    void          deleteBook(Long id);
    List<BookResponse> getAllBooks();
    List<BookResponse> getAvailableBooks();
    BookResponse  getBookById(Long id);
    Map<String, Object> importBooksFromCsv(MultipartFile file);

    // ── Paginated queries ─────────────────────────────────────────────────────
    PagedResponse<BookResponse> getAllBooks(Pageable pageable);
    PagedResponse<BookResponse> searchBooks(String query, Boolean available, Pageable pageable);
}

