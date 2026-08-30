package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.dto.response.UserResponse;
import com.library.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints for the currently authenticated user (any role).
 * Distinct from {@code /api/v1/admin/users} which is ADMIN-only.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Self-service endpoints for the signed-in user")
@SecurityRequirement(name = "BearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get my profile",
               description = "Returns the profile of the currently authenticated user "
                       + "(name, email, role, member ID, join date, and active-loan count).")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        // The JWT subject (and thus the principal name) is the user's email.
        UserResponse profile = userService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }
}
