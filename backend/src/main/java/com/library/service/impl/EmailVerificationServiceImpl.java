package com.library.service.impl;

import com.library.entity.EmailVerificationToken;
import com.library.entity.User;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.EmailVerificationTokenRepository;
import com.library.repository.UserRepository;
import com.library.service.EmailService;
import com.library.service.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationServiceImpl implements EmailVerificationService {

    private static final long TOKEN_VALIDITY_HOURS = 24;

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository                   userRepository;
    private final EmailService                     emailService;

    @Override
    @Transactional
    public void sendVerification(User user) {
        // Clean up any existing tokens
        tokenRepository.deleteByUser(user);

        String tokenStr = UUID.randomUUID().toString();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .token(tokenStr)
                .user(user)
                .expiryDate(Instant.now().plus(TOKEN_VALIDITY_HOURS, ChronoUnit.HOURS))
                .build();

        tokenRepository.save(token);
        emailService.sendVerificationEmail(user, tokenStr);
        log.info("Verification email sent to {}", user.getEmail());
    }

    @Override
    @Transactional
    public void verifyEmail(String tokenStr) {
        EmailVerificationToken token = tokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new BadRequestException("Verification link has expired. Please request a new one.");
        }

        User user = token.getUser();
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(token);

        log.info("Email verified for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + email));

        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        sendVerification(user);
    }
}
