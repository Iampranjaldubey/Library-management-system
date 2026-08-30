package com.library.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end HTTP contract for the hardened refresh-token lifecycle, exercised
 * against a real embedded container (RANDOM_PORT) on the H2 test profile:
 *
 *  - register/login deliver the refresh token ONLY in an HttpOnly cookie, never the body
 *  - /refresh rotates the cookie (new value each time)
 *  - replaying a rotated token is detected as reuse and revokes the whole family
 *  - /logout revokes the token and clears the cookie
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthRefreshTokenFlowTest {

    @Autowired private TestRestTemplate rest;
    @Autowired private ObjectMapper     objectMapper;

    // ── Helpers ─────────────────────────────────────────────────────────────

    private ResponseEntity<String> register(String email) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"name\":\"Refresh Tester\",\"email\":\"" + email
                + "\",\"password\":\"Passw0rd!23\"}";
        return rest.postForEntity("/api/v1/auth/register",
                new HttpEntity<>(body, headers), String.class);
    }

    /** The full Set-Cookie header line for the refresh token. */
    private String refreshSetCookie(ResponseEntity<?> response) {
        List<String> setCookies = response.getHeaders().get(HttpHeaders.SET_COOKIE);
        assertThat(setCookies).as("Set-Cookie header").isNotNull();
        return setCookies.stream()
                .filter(c -> c.startsWith("refresh_token="))
                .findFirst()
                .orElseThrow(() -> new AssertionError("no refresh_token cookie in " + setCookies));
    }

    /** The "refresh_token=VALUE" pair, ready to send back as a Cookie header. */
    private String refreshCookiePair(ResponseEntity<?> response) {
        return refreshSetCookie(response).split(";", 2)[0];
    }

    private ResponseEntity<String> postWithCookie(String path, String cookiePair) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.COOKIE, cookiePair);
        return rest.exchange(path, HttpMethod.POST, new HttpEntity<>(headers), String.class);
    }

    private String uniqueEmail() {
        return "refresh-" + UUID.randomUUID() + "@example.com";
    }

    // ── Tests ───────────────────────────────────────────────────────────────

    @Test
    void registerDeliversRefreshTokenOnlyViaHttpOnlyCookie() throws Exception {
        ResponseEntity<String> resp = register(uniqueEmail());

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        String setCookie = refreshSetCookie(resp);
        assertThat(setCookie).contains("HttpOnly");
        assertThat(setCookie).contains("Path=/api/v1/auth");

        JsonNode data = objectMapper.readTree(resp.getBody()).path("data");
        assertThat(data.path("token").asText()).isNotBlank();
        assertThat(data.hasNonNull("refreshToken"))
                .as("refresh token must NOT appear in the JSON body")
                .isFalse();
    }

    @Test
    void refreshRotatesTheCookieValue() throws Exception {
        String firstPair = refreshCookiePair(register(uniqueEmail()));

        ResponseEntity<String> refreshed = postWithCookie("/api/v1/auth/refresh", firstPair);

        assertThat(refreshed.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshCookiePair(refreshed))
                .as("refresh token should be rotated to a new value")
                .isNotEqualTo(firstPair);
        assertThat(objectMapper.readTree(refreshed.getBody()).path("data").path("token").asText())
                .isNotBlank();
    }

    @Test
    void replayingARotatedTokenIsDetectedAndRevokesAllSessions() throws Exception {
        String firstPair = refreshCookiePair(register(uniqueEmail()));

        // Legitimate rotation: first -> second.
        ResponseEntity<String> firstRefresh = postWithCookie("/api/v1/auth/refresh", firstPair);
        assertThat(firstRefresh.getStatusCode()).isEqualTo(HttpStatus.OK);
        String secondPair = refreshCookiePair(firstRefresh);

        // Attacker replays the already-rotated first token -> reuse detected.
        ResponseEntity<String> replay = postWithCookie("/api/v1/auth/refresh", firstPair);
        assertThat(replay.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        // Reuse detection revoked the whole family, so the second token is dead too.
        ResponseEntity<String> afterRevoke = postWithCookie("/api/v1/auth/refresh", secondPair);
        assertThat(afterRevoke.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void logoutClearsTheCookieAndRevokesTheToken() throws Exception {
        String pair = refreshCookiePair(register(uniqueEmail()));

        ResponseEntity<String> logout = postWithCookie("/api/v1/auth/logout", pair);
        assertThat(logout.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(refreshSetCookie(logout))
                .as("logout should send an expiring cookie")
                .containsAnyOf("Max-Age=0", "Expires=Thu, 01 Jan 1970");

        // The revoked token can no longer be used to refresh.
        ResponseEntity<String> refreshAfterLogout = postWithCookie("/api/v1/auth/refresh", pair);
        assertThat(refreshAfterLogout.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
