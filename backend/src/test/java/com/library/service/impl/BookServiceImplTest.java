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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookServiceImplTest {

    @Mock private BookRepository        bookRepository;
    @Mock private TransactionRepository transactionRepository;

    @InjectMocks private BookServiceImpl service;

    private Book book(long id, String isbn, int total, int available) {
        return Book.builder()
                .id(id).title("Clean Code").author("Martin").isbn(isbn)
                .category("Tech").totalCopies(total).availableCopies(available)
                .build();
    }

    private BookRequest request(String isbn, int totalCopies) {
        BookRequest r = new BookRequest();
        r.setTitle("Clean Code");
        r.setAuthor("Martin");
        r.setIsbn(isbn);
        r.setCategory("Tech");
        r.setTotalCopies(totalCopies);
        return r;
    }

    // ── addBook ───────────────────────────────────────────────────────────────

    @Test
    void addBookPersistsAndSetsAvailableEqualToTotal() {
        when(bookRepository.existsByIsbn("111")).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        BookResponse response = service.addBook(request("111", 5));

        assertThat(response.getTotalCopies()).isEqualTo(5);
        assertThat(response.getAvailableCopies()).isEqualTo(5);
        assertThat(response.isAvailable()).isTrue();
        assertThat(response.getIsbn()).isEqualTo("111");
    }

    @Test
    void addBookFloorsCopiesToAtLeastOne() {
        when(bookRepository.existsByIsbn("222")).thenReturn(false);
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        BookResponse response = service.addBook(request("222", 0));

        assertThat(response.getTotalCopies()).isEqualTo(1);
        assertThat(response.getAvailableCopies()).isEqualTo(1);
    }

    @Test
    void addBookRejectsDuplicateIsbn() {
        when(bookRepository.existsByIsbn("dup")).thenReturn(true);

        assertThatThrownBy(() -> service.addBook(request("dup", 1)))
                .isInstanceOf(DuplicateResourceException.class);
        verify(bookRepository, never()).save(any());
    }

    // ── updateBook ──────────────────────────────────────────────────────────────

    @Test
    void updateBookChangesEditableFields() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book(1L, "isbn-1", 3, 2)));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        BookRequest req = request("isbn-1", 3); // same ISBN -> no uniqueness check
        req.setTitle("Refactoring");
        req.setAuthor("Fowler");

        BookResponse response = service.updateBook(1L, req);

        assertThat(response.getTitle()).isEqualTo("Refactoring");
        assertThat(response.getAuthor()).isEqualTo("Fowler");
        // Copy counts are not touched by edit
        assertThat(response.getTotalCopies()).isEqualTo(3);
        assertThat(response.getAvailableCopies()).isEqualTo(2);
    }

    @Test
    void updateBookRejectsChangingToAnExistingIsbn() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book(1L, "old", 1, 1)));
        when(bookRepository.existsByIsbn("taken")).thenReturn(true);

        assertThatThrownBy(() -> service.updateBook(1L, request("taken", 1)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void updateBookNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateBook(99L, request("x", 1)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── deleteBook ──────────────────────────────────────────────────────────────

    @Test
    void deleteBookRemovesWhenNoHistory() {
        Book b = book(1L, "isbn-1", 1, 1);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(b));
        when(transactionRepository.existsByBookId(1L)).thenReturn(false);

        service.deleteBook(1L);

        verify(bookRepository).delete(b);
    }

    @Test
    void deleteBookBlockedByTransactionHistory() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book(1L, "isbn-1", 1, 1)));
        when(transactionRepository.existsByBookId(1L)).thenReturn(true);

        assertThatThrownBy(() -> service.deleteBook(1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("transaction history");
        verify(bookRepository, never()).delete(any());
    }

    // ── reads ─────────────────────────────────────────────────────────────────

    @Test
    void getBookByIdNotFound() {
        when(bookRepository.findById(7L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getBookById(7L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getAllBooksMapsEntities() {
        when(bookRepository.findAll()).thenReturn(List.of(book(1L, "a", 1, 1), book(2L, "b", 2, 0)));
        List<BookResponse> all = service.getAllBooks();
        assertThat(all).hasSize(2);
        assertThat(all.get(1).isAvailable()).isFalse(); // 0 available
    }

    @Test
    void getAvailableBooksUsesAvailabilityQuery() {
        when(bookRepository.findAvailable()).thenReturn(List.of(book(1L, "a", 1, 1)));
        assertThat(service.getAvailableBooks()).hasSize(1);
    }

    // ── search branches ─────────────────────────────────────────────────────────

    private Page<Book> onePage() {
        return new PageImpl<>(List.of(book(1L, "a", 1, 1)), PageRequest.of(0, 10), 1);
    }

    @Test
    void searchWithQueryAndAvailableTrue() {
        Pageable p = PageRequest.of(0, 10);
        when(bookRepository.searchAvailableBooks("clean", p)).thenReturn(onePage());
        PagedResponse<BookResponse> res = service.searchBooks("clean", true, p);
        assertThat(res.getContent()).hasSize(1);
        assertThat(res.getTotalElements()).isEqualTo(1);
    }

    @Test
    void searchWithQueryAndAvailableFalse() {
        Pageable p = PageRequest.of(0, 10);
        when(bookRepository.searchUnavailableBooks("clean", p)).thenReturn(onePage());
        assertThat(service.searchBooks("clean", false, p).getContent()).hasSize(1);
    }

    @Test
    void searchWithQueryNoAvailabilityFilter() {
        Pageable p = PageRequest.of(0, 10);
        when(bookRepository.searchBooks("clean", p)).thenReturn(onePage());
        assertThat(service.searchBooks("clean", null, p).getContent()).hasSize(1);
    }

    @Test
    void searchNoQueryAvailableOnly() {
        Pageable p = PageRequest.of(0, 10);
        when(bookRepository.findAvailable(p)).thenReturn(onePage());
        assertThat(service.searchBooks(" ", true, p).getContent()).hasSize(1);
    }

    @Test
    void searchNoQueryUnavailableOnly() {
        Pageable p = PageRequest.of(0, 10);
        when(bookRepository.findUnavailable(p)).thenReturn(onePage());
        assertThat(service.searchBooks(null, false, p).getContent()).hasSize(1);
    }

    @Test
    void searchNoQueryNoFilterReturnsAll() {
        Pageable p = PageRequest.of(0, 10);
        when(bookRepository.findAll(p)).thenReturn(onePage());
        assertThat(service.searchBooks(null, null, p).getContent()).hasSize(1);
    }
}
