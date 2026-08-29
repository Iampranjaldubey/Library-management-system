package com.library.service.impl;

import com.library.dto.request.RefreshTokenRequest;
import com.library.dto.response.AuthResponse;
import com.library.entity.RefreshToken;
import com.library.entity.User;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.RefreshTokenRepository;
import com.library.security.JwtUtil;
import com.library.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @Value("${app.jwt.refresh-expiration-ms}")
    private Long refreshTokenDurationMs;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke existing tokens for the user to ensure single active session per user
        // (If multiple device support is needed, this logic can be modified)
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Refresh token was expired. Please make a new signin request");
        }
        if (token.isRevoked()) {
            throw new RuntimeException("Refresh token has been revoked.");
        }
        return token;
    }

    @Override
    @Transactional
    public AuthResponse generateNewTokens(RefreshTokenRequest request) {
        return refreshTokenRepository.findByToken(request.getRefreshToken())
                .map(this::verifyExpiration)
                .map(refreshToken -> {
                    User user = refreshToken.getUser();
                    String accessToken = jwtUtil.generateToken(user);
                    
                    return AuthResponse.builder()
                            .token(accessToken)
                            .refreshToken(refreshToken.getToken())
                            .id(user.getId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .role(user.getRole())
                            .build();
                })
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));
    }

    @Override
    @Transactional
    public void revokeTokens(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
