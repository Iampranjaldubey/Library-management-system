package com.library.service.impl;

import com.library.entity.PasswordResetToken;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.repository.PasswordResetTokenRepository;
import com.library.repository.UserRepository;
import com.library.service.EmailService;
import com.library.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private static final long TOKEN_VALIDITY_HOURS = 1;

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository               userRepository;
    private final PasswordEncoder              passwordEncoder;
    private final EmailService                 emailService;

    @Override
    @Transactional
    public void requestReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Don't reveal whether the email exists — silently return
            log.warn("Password reset requested for non-existent email: {}", email);
            return;
        }

        User user = userOpt.get();

        // Clean up any existing tokens for this user
        tokenRepository.deleteByUser(user);

        String tokenStr = UUID.randomUUID().toString();
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenStr)
                .user(user)
                .expiryDate(Instant.now().plus(TOKEN_VALIDITY_HOURS, ChronoUnit.HOURS))
                .used(false)
                .build();

        tokenRepository.save(token);
        emailService.sendPasswordResetEmail(user, tokenStr);
        log.info("Password reset token generated for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(String tokenStr, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (token.isUsed()) {
            throw new BadRequestException("This reset link has already been used");
        }

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new BadRequestException("This reset link has expired. Please request a new one.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        log.info("Password reset successful for user: {}", user.getEmail());
    }
}
