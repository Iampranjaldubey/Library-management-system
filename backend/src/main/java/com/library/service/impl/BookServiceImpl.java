package com.library.service.impl;

import com.library.dto.request.BookRequest;
import com.library.dto.response.BookResponse;
import com.library.dto.response.PagedResponse;
import com.library.entity.Book;
import com.library.exception.BadRequestException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import com.library.service.BookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookServiceImpl implements BookService {

    private final BookRepository        bookRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public BookResponse addBook(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException(
                    "Book with ISBN " + request.getIsbn() + " already exists");
        }

        int copies = Math.max(1, request.getTotalCopies());

        Book book = Book.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .category(request.getCategory())
                .totalCopies(copies)
                .availableCopies(copies)
                .build();

        Book saved = bookRepository.save(book);
        log.info("Book added: '{}' (ISBN: {}, copies: {})", saved.getTitle(), saved.getIsbn(), copies);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = fetchBook(id);

        // Enforce ISBN uniqueness only when the ISBN actually changes
        if (!book.getIsbn().equals(request.getIsbn())
                && bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException(
                    "Book with ISBN " + request.getIsbn() + " already exists");
        }

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());
        // Copy counts are managed via the add flow and issue/return, not this edit endpoint.

        Book saved = bookRepository.save(book);
        log.info("Book updated: '{}' (ISBN: {}, id: {})", saved.getTitle(), saved.getIsbn(), id);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        Book book = fetchBook(id);

        // A book referenced by any transaction cannot be removed — this preserves
        // borrowing history and respects the transactions→books foreign key.
        if (transactionRepository.existsByBookId(id)) {
            throw new BadRequestException(
                    "Cannot delete '" + book.getTitle()
                    + "' because it has transaction history.");
        }

        bookRepository.delete(book);
        log.info("Book deleted: '{}' (id: {})", book.getTitle(), id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getAvailableBooks() {
        return bookRepository.findAvailable()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookResponse getBookById(Long id) {
        return toResponse(fetchBook(id));
    }

    // ── Paginated queries ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> getAllBooks(Pageable pageable) {
        Page<Book> page = bookRepository.findAll(pageable);
        return toPagedResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> searchBooks(String query, Boolean available, Pageable pageable) {
        Page<Book> page;
        if (query != null && !query.isBlank()) {
            if (available != null) {
                page = available
                        ? bookRepository.searchAvailableBooks(query, pageable)
                        : bookRepository.searchUnavailableBooks(query, pageable);
            } else {
                page = bookRepository.searchBooks(query, pageable);
            }
        } else if (available != null) {
            page = available
                    ? bookRepository.findAvailable(pageable)
                    : bookRepository.findUnavailable(pageable);
        } else {
            page = bookRepository.findAll(pageable);
        }
        return toPagedResponse(page);
    }

    // ── CSV Import ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Map<String, Object> importBooksFromCsv(MultipartFile file) {
        int successCount = 0;
        int skipCount = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            int lineNumber = 0;

            while ((line = br.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) continue;

                // Handle header
                if (isFirstLine) {
                    isFirstLine = false;
                    // If it looks like a header, skip it
                    if (line.toLowerCase().contains("title") && line.toLowerCase().contains("author")) {
                        continue;
                    }
                }

                // Simple split (won't handle quotes with commas inside, but sufficient for simple data)
                String[] columns = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                
                if (columns.length < 5) {
                    skipCount++;
                    errors.add("Line " + lineNumber + ": Invalid format (expected 5 columns, got " + columns.length + ")");
                    continue;
                }

                String title = columns[0].replace("\"", "").trim();
                String author = columns[1].replace("\"", "").trim();
                String isbn = columns[2].replace("\"", "").trim();
                String category = columns[3].replace("\"", "").trim();
                int totalCopies;

                try {
                    totalCopies = Integer.parseInt(columns[4].trim());
                    if (totalCopies < 1) totalCopies = 1;
                } catch (NumberFormatException e) {
                    skipCount++;
                    errors.add("Line " + lineNumber + ": Invalid total copies number");
                    continue;
                }

                // Check ISBN unique
                if (bookRepository.existsByIsbn(isbn)) {
                    skipCount++;
                    errors.add("Line " + lineNumber + ": ISBN " + isbn + " already exists");
                    continue;
                }

                Book book = Book.builder()
                        .title(title)
                        .author(author)
                        .isbn(isbn)
                        .category(category)
                        .totalCopies(totalCopies)
                        .availableCopies(totalCopies)
                        .build();

                bookRepository.save(book);
                successCount++;
            }
        } catch (Exception e) {
            throw new BadRequestException("Failed to process CSV file: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("skipCount", skipCount);
        result.put("errors", errors);
        return result;
    }

    // ── Package-level helper used by TransactionService ───────────────────────
    public Book fetchBook(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────
    private BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .category(book.getCategory())
                .available(book.isAvailable())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .build();
    }

    private PagedResponse<BookResponse> toPagedResponse(Page<Book> page) {
        return PagedResponse.<BookResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}


