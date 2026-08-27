package com.library.controller;

import com.library.dto.request.*;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.AuthResponse;
import com.library.service.AuthService;
import com.library.service.EmailVerificationService;
import com.library.service.PasswordResetService;
import com.library.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, and account management endpoints")
public class AuthController {

    private final AuthService              authService;
    private final RefreshTokenService      refreshTokenService;
    private final PasswordResetService     passwordResetService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user",
               description = "Creates a new user account, sends a verification email, and returns a JWT token.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Registration successful. Please check your email to verify your account.", response));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user",
               description = "Validates credentials and returns a JWT token. Requires a verified email.")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token",
               description = "Uses a valid refresh token to generate a new access token.")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {

        AuthResponse response = refreshTokenService.generateNewTokens(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    // ── Password Reset ────────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset",
               description = "Sends a password reset email if the account exists. Always returns 200 to prevent email enumeration.")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        passwordResetService.requestReset(request.getEmail());
        return ResponseEntity.ok(
                ApiResponse.success("If an account exists with this email, a reset link has been sent.", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password",
               description = "Validates the reset token and sets a new password.")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Password reset successful. You can now log in with your new password.", null));
    }

    // ── Email Verification ────────────────────────────────────────────────────

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email address",
               description = "Verifies the user's email using the token from the verification email.")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam String token) {

        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(
                ApiResponse.success("Email verified successfully. You can now log in.", null));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email",
               description = "Sends a new verification email to the given address.")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {

        emailVerificationService.resendVerification(request.getEmail());
        return ResponseEntity.ok(
                ApiResponse.success("Verification email sent. Please check your inbox.", null));
    }
}

