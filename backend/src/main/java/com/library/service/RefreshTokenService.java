package com.library.service;

import com.library.dto.response.AuthResponse;
import com.library.entity.RefreshToken;
import com.library.entity.User;

public interface RefreshTokenService {

    /** Issues a brand-new active refresh token for the user (used on login/register). */
    RefreshToken createRefreshToken(User user);

    /**
     * Validates a presented refresh token and rotates it: the presented token is
     * revoked and a fresh one is issued. If the presented token is already revoked
     * (i.e. it was rotated previously), this is treated as reuse — every token for
     * the user is revoked and the caller is forced to re-authenticate.
     *
     * @return the new access token + user info, plus the new refresh-token value
     *         (to be written into the HttpOnly cookie by the controller)
     */
    RotatedTokens rotate(String presentedRefreshToken);

    /** Revokes a single token (logout of the current session). No-op if unknown. */
    void revokeByToken(String presentedRefreshToken);

    /** Revokes every active token for a user (logout-everywhere / reuse response). */
    void revokeAllForUser(User user);

    /** Result of a successful rotation. */
    record RotatedTokens(AuthResponse authResponse, String refreshTokenValue) {}
}
