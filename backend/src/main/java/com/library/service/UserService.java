package com.library.service;

import com.library.dto.request.UserUpdateRequest;
import com.library.dto.response.PagedResponse;
import com.library.dto.response.TransactionResponse;
import com.library.dto.response.UserResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    PagedResponse<UserResponse> getAllUsers(Pageable pageable);
    PagedResponse<UserResponse> searchUsers(String query, Pageable pageable);
    UserResponse getUserById(Long id);
    /** Profile of the currently authenticated user, looked up by email (the JWT subject). */
    UserResponse getCurrentUser(String email);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    UserResponse deactivateUser(Long id);
    UserResponse activateUser(Long id);
    List<TransactionResponse> getUserTransactions(Long userId);
}
