package com.library.service.impl;

import com.library.dto.request.UserUpdateRequest;
import com.library.dto.response.PagedResponse;
import com.library.dto.response.TransactionResponse;
import com.library.dto.response.UserResponse;
import com.library.entity.Book;
import com.library.entity.Role;
import com.library.entity.Transaction;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository        userRepository;
    @Mock private TransactionRepository transactionRepository;

    @InjectMocks private UserServiceImpl service;

    private User user(long id, String email, boolean active) {
        return User.builder()
                .id(id).name("Ada").email(email).password("hash").role(Role.USER)
                .active(active).emailVerified(true).memberId("LIB-00001").build();
    }

    // ── getUserById / getCurrentUser ────────────────────────────────────────────

    @Test
    void getUserByIdMapsWithActiveLoanCount() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L))
                .thenReturn(List.of(new Transaction(), new Transaction()));

        UserResponse r = service.getUserById(1L);

        assertThat(r.getEmail()).isEqualTo("a@x.com");
        assertThat(r.getActiveLoans()).isEqualTo(2);
    }

    @Test
    void getUserByIdNotFound() {
        when(userRepository.findById(9L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getUserById(9L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCurrentUserMapsByEmail() {
        when(userRepository.findByEmail("a@x.com")).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        UserResponse r = service.getCurrentUser("a@x.com");

        assertThat(r.getMemberId()).isEqualTo("LIB-00001");
        assertThat(r.getActiveLoans()).isZero();
    }

    @Test
    void getCurrentUserNotFound() {
        when(userRepository.findByEmail("no@x.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getCurrentUser("no@x.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── updateUser ──────────────────────────────────────────────────────────────

    @Test
    void updateUserChangesName() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        UserUpdateRequest req = new UserUpdateRequest();
        req.setName("Ada Lovelace");

        assertThat(service.updateUser(1L, req).getName()).isEqualTo("Ada Lovelace");
    }

    @Test
    void updateUserChangesEmailWhenUnique() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        when(userRepository.existsByEmail("new@x.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        UserUpdateRequest req = new UserUpdateRequest();
        req.setEmail("new@x.com");

        assertThat(service.updateUser(1L, req).getEmail()).isEqualTo("new@x.com");
    }

    @Test
    void updateUserRejectsDuplicateEmail() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        when(userRepository.existsByEmail("taken@x.com")).thenReturn(true);

        UserUpdateRequest req = new UserUpdateRequest();
        req.setEmail("taken@x.com");

        assertThatThrownBy(() -> service.updateUser(1L, req))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // ── activate / deactivate ─────────────────────────────────────────────────

    @Test
    void deactivateActiveUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        assertThat(service.deactivateUser(1L).isActive()).isFalse();
    }

    @Test
    void deactivateAlreadyInactiveUserRejected() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", false)));
        assertThatThrownBy(() -> service.deactivateUser(1L))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void activateInactiveUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", false)));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        assertThat(service.activateUser(1L).isActive()).isTrue();
    }

    @Test
    void activateAlreadyActiveUserRejected() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user(1L, "a@x.com", true)));
        assertThatThrownBy(() -> service.activateUser(1L))
                .isInstanceOf(BadRequestException.class);
    }

    // ── getUserTransactions (status derivation) ─────────────────────────────────

    @Test
    void getUserTransactionsDerivesStatuses() {
        User u = user(1L, "a@x.com", true);
        Book b = Book.builder().id(2L).title("DDD").author("E").isbn("i")
                .category("t").totalCopies(1).availableCopies(1).build();
        LocalDate today = LocalDate.now();

        Transaction active = Transaction.builder().id(10L).user(u).book(b)
                .issueDate(today.minusDays(1)).dueDate(today.plusDays(6)).build();
        Transaction overdue = Transaction.builder().id(11L).user(u).book(b)
                .issueDate(today.minusDays(10)).dueDate(today.minusDays(1)).build();
        Transaction returned = Transaction.builder().id(12L).user(u).book(b)
                .issueDate(today.minusDays(10)).dueDate(today.minusDays(3))
                .returnDate(today.minusDays(2)).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(u));
        when(transactionRepository.findByUserIdWithDetails(1L))
                .thenReturn(List.of(active, overdue, returned));

        List<TransactionResponse> rows = service.getUserTransactions(1L);

        assertThat(rows).extracting(TransactionResponse::getStatus)
                .containsExactly("ACTIVE", "OVERDUE", "RETURNED");
    }

    @Test
    void getUserTransactionsUserNotFound() {
        when(userRepository.findById(9L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getUserTransactions(9L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── paged list / search ─────────────────────────────────────────────────────

    @Test
    void getAllUsersPaged() {
        Pageable p = PageRequest.of(0, 20);
        when(userRepository.findAll(p))
                .thenReturn(new PageImpl<>(List.of(user(1L, "a@x.com", true)), p, 1));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        PagedResponse<UserResponse> res = service.getAllUsers(p);
        assertThat(res.getContent()).hasSize(1);
        assertThat(res.getTotalElements()).isEqualTo(1);
    }

    @Test
    void searchUsersWithQuery() {
        Pageable p = PageRequest.of(0, 20);
        when(userRepository.search("ada", p))
                .thenReturn(new PageImpl<>(List.of(user(1L, "a@x.com", true)), p, 1));
        when(transactionRepository.findByUserIdAndReturnDateIsNull(1L)).thenReturn(List.of());

        assertThat(service.searchUsers("ada", p).getContent()).hasSize(1);
    }

    @Test
    void searchUsersBlankQueryFallsBackToFindAll() {
        Pageable p = PageRequest.of(0, 20);
        when(userRepository.findAll(p)).thenReturn(new PageImpl<>(List.of(), p, 0));
        assertThat(service.searchUsers("  ", p).getContent()).isEmpty();
    }
}
