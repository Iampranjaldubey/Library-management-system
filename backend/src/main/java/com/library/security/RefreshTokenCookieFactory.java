package com.library.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Builds the refresh-token cookie. The token is delivered ONLY in this
 * HttpOnly cookie (never in the JSON body), so client-side JavaScript — and
 * therefore any XSS payload — cannot read it.
 *
 * <p>Attributes are configurable so the same code works across environments:
 * <ul>
 *   <li><b>Production (cross-site Vercel → Railway):</b> {@code SameSite=None} + {@code Secure=true}.</li>
 *   <li><b>Local dev (same-origin via the Next.js proxy over http):</b> {@code SameSite=Lax} + {@code Secure=false}.</li>
 * </ul>
 * The cookie is scoped to {@code /api/v1/auth} so it's only ever sent to the
 * refresh/logout endpoints, not to every API call.
 */
@Component
public class RefreshTokenCookieFactory {

    /** Fixed name so it can also be read via {@code @CookieValue} on the controller. */
    public static final String COOKIE_NAME = "refresh_token";

    @Value("${app.auth.refresh-cookie.secure:true}")
    private boolean secure;

    @Value("${app.auth.refresh-cookie.same-site:None}")
    private String sameSite;

    @Value("${app.auth.refresh-cookie.path:/api/v1/auth}")
    private String path;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    /** Cookie that carries a freshly issued refresh token. */
    public ResponseCookie create(String tokenValue) {
        return baseBuilder(tokenValue)
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    /** Zero-age cookie that instructs the browser to delete the refresh token. */
    public ResponseCookie clearing() {
        return baseBuilder("")
                .maxAge(0)
                .build();
    }

    private ResponseCookie.ResponseCookieBuilder baseBuilder(String value) {
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path);
    }
}
