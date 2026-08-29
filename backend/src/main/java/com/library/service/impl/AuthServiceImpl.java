package com.library.service.impl;

import com.library.dto.request.LoginRequest;
import com.library.dto.request.RegisterRequest;
import com.library.dto.response.AuthResponse;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.DuplicateResourceException;
import com.library.repository.UserRepository;
import com.library.security.JwtUtil;
import com.library.service.AuthService;
import com.library.service.EmailVerificationService;
import com.library.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository          userRepository;
    private final PasswordEncoder         passwordEncoder;
    private final JwtUtil                 jwtUtil;
    private final AuthenticationManager   authenticationManager;
    private final RefreshTokenService     refreshTokenService;
    private final EmailVerificationService emailVerificationService;

    @Value("${app.auth.require-email-verification:true}")
    private boolean requireEmailVerification;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "Email already registered: " + request.getEmail());
        }

        // Generate member ID
        Long maxId = userRepository.findMaxId();
        long nextNum = (maxId != null ? maxId : 0) + 1;
        String memberId = String.format("LIB-%05d", nextNum);

        // Security: All public registrations default to USER role.
        // Only an ADMIN can promote users via the admin endpoint.
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .memberId(memberId)
                .emailVerified(!requireEmailVerification)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        log.info("New user registered: {} ({}) — member ID: {}", saved.getEmail(), saved.getRole(), memberId);

        // Send verification email (async — doesn't block the response)
        if (requireEmailVerification) {
            emailVerificationService.sendVerification(saved);
        }

        // Return a response with token even though user is unverified.
        // The frontend will show a "check your email" message.
        // Note: The user won't be able to log in until verified (isEnabled=false).
        String token = jwtUtil.generateToken(saved);
        String refreshToken = refreshTokenService.createRefreshToken(saved).getToken();
        return buildAuthResponse(saved, token, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Check if user exists and is verified before attempting authentication
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (requireEmailVerification && !user.isEmailVerified()) {
            throw new BadRequestException(
                    "Please verify your email before logging in. Check your inbox for a verification link.");
        }

        if (!user.isActive()) {
            throw new BadRequestException(
                    "Your account has been deactivated. Please contact the library administrator.");
        }

        // Will throw BadCredentialsException on failure → handled globally
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        String token = jwtUtil.generateToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user).getToken();
        log.info("User logged in: {} ({})", user.getEmail(), user.getRole());
        return buildAuthResponse(user, token, refreshToken);
    }

    // ── Helper ─────────────────────────────────────────────────────────────────
    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}

