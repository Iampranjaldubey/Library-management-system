package com.library.controller;

import com.library.dto.request.RoleUpdateRequest;
import com.library.dto.request.UserUpdateRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.PagedResponse;
import com.library.dto.response.TransactionResponse;
import com.library.dto.response.UserResponse;
import com.library.entity.User;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.UserRepository;
import com.library.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "Administrative operations (ADMIN only)")
@SecurityRequirement(name = "BearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final UserService    userService;

    @GetMapping("/users")
    @Operation(summary = "List all users (paginated)",
               description = "Returns registered users with optional search. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @Parameter(description = "Search query (name, email, or member ID)")
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC)
            Pageable pageable) {

        PagedResponse<UserResponse> result = userService.searchUsers(q, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", result));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID",
               description = "Returns a single user. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User fetched successfully", userService.getUserById(id)));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Update user details",
               description = "Updates a user's name and/or email. Requires ADMIN role.")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {

        UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Update user role",
               description = """
                       Changes a user's role. Only ADMIN users can perform this action.
                       Valid roles: ADMIN, LIBRARIAN, USER.
                       """)
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleUpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        log.info("Role change: user {} ({}) from {} to {}",
                user.getEmail(), user.getId(), user.getRole(), request.getRole());

        user.setRole(request.getRole());
        userRepository.save(user);

        return ResponseEntity.ok(
                ApiResponse.success("User role updated successfully", userService.getUserById(id)));
    }

    @PutMapping("/users/{id}/deactivate")
    @Operation(summary = "Deactivate a user",
               description = "Deactivates a member account. They will not be able to log in.")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User deactivated successfully", userService.deactivateUser(id)));
    }

    @PutMapping("/users/{id}/activate")
    @Operation(summary = "Activate a user",
               description = "Reactivates a previously deactivated member account.")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User activated successfully", userService.activateUser(id)));
    }

    @GetMapping("/users/{id}/transactions")
    @Operation(summary = "Get user borrowing history",
               description = "Returns all transactions for a specific user.")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getUserTransactions(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("User transactions fetched successfully",
                        userService.getUserTransactions(id)));
    }
}

