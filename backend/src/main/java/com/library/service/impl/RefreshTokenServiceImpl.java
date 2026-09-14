package com.library.service.impl;

import com.library.dto.response.AuthResponse;
import com.library.entity.RefreshToken;
import com.library.entity.User;
import com.library.exception.TokenRefreshException;
import com.library.repository.RefreshTokenRepository;
import com.library.security.JwtUtil;
import com.library.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.jwt.refresh-expiration-ms}")
    private Long refreshTokenDurationMs;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Housekeeping: purge globally-expired tokens so the table doesn't grow
        // unbounded now that we retain revoked (rotated) rows for reuse detection.
        refreshTokenRepository.deleteByExpiryDateBefore(Instant.now());

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    // noRollbackFor is critical: on reuse/expiry we revoke tokens AND throw. Without
    // this, the thrown RuntimeException would roll back the very revocation we just
    // performed, defeating reuse detection.
    @Override
    @Transactional(noRollbackFor = TokenRefreshException.class)
    public RotatedTokens rotate(String presentedRefreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(presentedRefreshToken)
                .orElseThrow(() -> new TokenRefreshException(
                        "Invalid refresh token. Please sign in again."));

        // Reuse detection: a token that's already been rotated (revoked) is being
        // presented again — the hallmark of a stolen/replayed token. Revoke the
        // whole family so neither the attacker nor the victim can keep refreshing.
        if (token.isRevoked()) {
            log.warn("Refresh token reuse detected for user id={} — revoking all sessions",
                    token.getUser().getId());
            refreshTokenRepository.revokeAllByUser(token.getUser());
            throw new TokenRefreshException(
                    "Refresh token reuse detected. All sessions were revoked; please sign in again.");
        }

        if (token.getExpiryDate().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new TokenRefreshException("Refresh token expired. Please sign in again.");
        }

        // Rotate: revoke the presented token and mint a fresh one for the same user.
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = token.getUser();
        RefreshToken next = createRefreshToken(user);
        String accessToken = jwtUtil.generateToken(user);

        AuthResponse authResponse = AuthResponse.builder()
                .token(accessToken)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

        return new RotatedTokens(authResponse, next.getToken());
    }

    @Override
    @Transactional
    public void revokeByToken(String presentedRefreshToken) {
        if (presentedRefreshToken == null || presentedRefreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.findByToken(presentedRefreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }
}
