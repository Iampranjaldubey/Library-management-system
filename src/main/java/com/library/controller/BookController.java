package com.library.controller;

import com.library.dto.request.BookRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.BookResponse;
import com.library.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Book catalogue management")
@SecurityRequirement(name = "BearerAuth")
public class BookController {

    private final BookService bookService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    @Operation(summary = "Add a new book",
               description = "Adds a book to the catalogue. Requires ADMIN or LIBRARIAN role.")
    public ResponseEntity<ApiResponse<BookResponse>> addBook(
            @Valid @RequestBody BookRequest request) {

        BookResponse response = bookService.addBook(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book added successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all books",
               description = "Returns the full catalogue. Optionally filter by ?available=true.")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getAllBooks(
            @Parameter(description = "Filter by availability (optional)")
            @RequestParam(required = false) Boolean available) {

        List<BookResponse> books = (available != null && available)
                ? bookService.getAvailableBooks()
                : bookService.getAllBooks();

        return ResponseEntity.ok(ApiResponse.success("Books fetched successfully", books));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book by ID")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success("Book fetched successfully", bookService.getBookById(id)));
    }
}
