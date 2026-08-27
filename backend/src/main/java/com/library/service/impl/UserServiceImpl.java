package com.library.service.impl;

import com.library.dto.request.UserUpdateRequest;
import com.library.dto.response.PagedResponse;
import com.library.dto.response.TransactionResponse;
import com.library.dto.response.UserResponse;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.TransactionRepository;
import com.library.repository.UserRepository;
import com.library.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository        userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        return toPagedResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> searchUsers(String query, Pageable pageable) {
        Page<User> page = (query != null && !query.isBlank())
                ? userRepository.search(query, pageable)
                : userRepository.findAll(pageable);
        return toPagedResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUser(id);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = findUser(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) &&
                    userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException(
                        "Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        User saved = userRepository.save(user);
        log.info("User {} updated", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = findUser(id);
        if (!user.isActive()) {
            throw new BadRequestException("User is already deactivated");
        }
        user.setActive(false);
        User saved = userRepository.save(user);
        log.info("User {} ({}) deactivated", saved.getId(), saved.getEmail());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse activateUser(Long id) {
        User user = findUser(id);
        if (user.isActive()) {
            throw new BadRequestException("User is already active");
        }
        user.setActive(true);
        User saved = userRepository.save(user);
        log.info("User {} ({}) activated", saved.getId(), saved.getEmail());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getUserTransactions(Long userId) {
        findUser(userId); // validates existence
        return transactionRepository.findByUserIdWithDetails(userId)
                .stream()
                .map(tx -> {
                    String status;
                    if (tx.getReturnDate() != null) {
                        status = "RETURNED";
                    } else if (LocalDate.now().isAfter(tx.getDueDate())) {
                        status = "OVERDUE";
                    } else {
                        status = "ACTIVE";
                    }
                    return TransactionResponse.builder()
                            .id(tx.getId())
                            .userId(tx.getUser().getId())
                            .userName(tx.getUser().getName())
                            .bookId(tx.getBook().getId())
                            .bookTitle(tx.getBook().getTitle())
                            .issueDate(tx.getIssueDate())
                            .dueDate(tx.getDueDate())
                            .returnDate(tx.getReturnDate())
                            .fine(tx.getFine())
                            .finePaid(tx.isFinePaid())
                            .finePaymentDate(tx.getFinePaymentDate())
                            .status(status)
                            .build();
                })
                .toList();
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UserResponse toResponse(User user) {
        long activeLoans = transactionRepository.findByUserIdAndReturnDateIsNull(user.getId()).size();
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .memberId(user.getMemberId())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .activeLoans(activeLoans)
                .build();
    }

    private PagedResponse<UserResponse> toPagedResponse(Page<User> page) {
        return PagedResponse.<UserResponse>builder()
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
