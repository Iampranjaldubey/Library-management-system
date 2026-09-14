package com.library.service.impl;

import com.library.dto.request.ReturnRequest;
import com.library.dto.response.TransactionResponse;
import com.library.entity.Book;
import com.library.entity.Role;
import com.library.entity.Transaction;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.repository.BookRepository;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the overdue-fine calculation in {@link TransactionServiceImpl#returnBook}.
 *
 * <p>Pure Mockito — no Spring context, no database — so these run in milliseconds
 * and pin down the money math independently of persistence. The rule under test:
 * ₹5 per day for every day strictly after the due date; no fine on or before it.
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceFineTest {

    private static final double FINE_PER_DAY_RS = 5.0;

    @Mock private TransactionRepository      transactionRepository;
    @Mock private BookRepository             bookRepository;
    @Mock private UserRepository             userRepository;
    @Mock private PlatformTransactionManager transactionManager;

    @InjectMocks private TransactionServiceImpl service;

    /** Builds an active (not yet returned) loan whose due date is {@code dueDate}. */
    private Transaction activeLoanDueOn(LocalDate dueDate) {
        User user = User.builder()
                .id(1L).name("Reader").email("reader@example.com").role(Role.USER).build();
        Book book = Book.builder()
                .id(2L).title("Domain-Driven Design").author("Evans")
                .isbn("978-0321125217").category("Tech")
                .totalCopies(3).availableCopies(1).build();
        return Transaction.builder()
                .id(10L).user(user).book(book)
                .issueDate(dueDate.minusDays(7)).dueDate(dueDate)
                .returnDate(null).finePaid(false).build();
    }

    /** Returns the loan today and hands back the resulting response. */
    private TransactionResponse returnLoanDueOn(LocalDate dueDate) {
        when(transactionRepository.findByIdWithDetails(10L))
                .thenReturn(Optional.of(activeLoanDueOn(dueDate)));
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        ReturnRequest request = new ReturnRequest();
        request.setTransactionId(10L);
        return service.returnBook(request);
    }

    @Test
    void noFineWhenReturnedBeforeDueDate() {
        TransactionResponse response = returnLoanDueOn(LocalDate.now().plusDays(3));
        assertThat(response.getFine()).isNull();
        assertThat(response.getStatus()).isEqualTo("RETURNED");
    }

    @Test
    void noFineWhenReturnedExactlyOnDueDate() {
        // Boundary: returned the same day it's due — strictly "not after", so no fine.
        TransactionResponse response = returnLoanDueOn(LocalDate.now());
        assertThat(response.getFine()).isNull();
    }

    @Test
    void oneDayLateChargesOneDay() {
        TransactionResponse response = returnLoanDueOn(LocalDate.now().minusDays(1));
        assertThat(response.getFine()).isEqualTo(FINE_PER_DAY_RS);
    }

    @Test
    void manyDaysLateChargesPerDay() {
        TransactionResponse response = returnLoanDueOn(LocalDate.now().minusDays(10));
        assertThat(response.getFine()).isEqualTo(10 * FINE_PER_DAY_RS);
    }

    @Test
    void returningAnAlreadyReturnedLoanIsRejected() {
        Transaction alreadyReturned = activeLoanDueOn(LocalDate.now().minusDays(2));
        alreadyReturned.setReturnDate(LocalDate.now().minusDays(1));
        when(transactionRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(alreadyReturned));

        ReturnRequest request = new ReturnRequest();
        request.setTransactionId(10L);

        assertThatThrownBy(() -> service.returnBook(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already been returned");
    }
}
