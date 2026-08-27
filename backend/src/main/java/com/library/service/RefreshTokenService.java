package com.library.service;

import com.library.dto.request.RefreshTokenRequest;
import com.library.dto.response.AuthResponse;
import com.library.entity.RefreshToken;
import com.library.entity.User;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(User user);
    RefreshToken verifyExpiration(RefreshToken token);
    AuthResponse generateNewTokens(RefreshTokenRequest request);
    void revokeTokens(User user);
}
