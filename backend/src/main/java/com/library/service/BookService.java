package com.library.service;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;

import java.util.List;

public interface BookService {
    BookResponse  addBook(BookRequest request);
    List<BookResponse> getAllBooks();
    List<BookResponse> getAvailableBooks();
    BookResponse  getBookById(Long id);
}
