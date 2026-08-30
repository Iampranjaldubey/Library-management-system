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

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the HTTP status contract of the security layer against a REAL
 * embedded servlet container (RANDOM_PORT), not MockMvc.
 *
 * This distinction matters: the "401 vs 403" defect only reproduces in a real
 * container, where a 403 triggers an internal ERROR dispatch to /error that the
 * authorization layer re-evaluates. MockMvc does not perform that dispatch, so
 * it cannot catch this regression.
 *
 *  - No credentials on a role-protected endpoint   -> 401 Unauthorized
 *  - Valid credentials but insufficient role        -> 403 Forbidden
 *
 * A body-free GET is used so the JDK HTTP client reports the status cleanly
 * (a POST-with-body that receives a 401 makes it throw HttpRetryException).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SecurityAuthorizationTest {

    /** ADMIN/LIBRARIAN-only endpoint, used to exercise role-based denial. */
    private static final String PROTECTED_URL = "/api/v1/transactions";

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private ObjectMapper objectMapper;

    /** Registers a new user (defaults to USER role) and returns their JWT. */
    private String registerAndGetToken(String email) throws Exception {
        String body = "{\"name\":\"Sec Test\",\"email\":\"" + email + "\",\"password\":\"Passw0rd!23\"}";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> resp = rest.postForEntity(
                "/api/v1/auth/register", new HttpEntity<>(body, headers), String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        JsonNode node = objectMapper.readTree(resp.getBody());
        return node.path("data").path("token").asText();
    }

    @Test
    void unauthenticatedRequestReturns401() {
        ResponseEntity<String> resp = rest.exchange(
                PROTECTED_URL, HttpMethod.GET, HttpEntity.EMPTY, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void authenticatedUserWithoutRoleReturns403() throws Exception {
        String token = registerAndGetToken("sec-user@example.com");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<String> resp = rest.exchange(
                PROTECTED_URL, HttpMethod.GET, new HttpEntity<>(headers), String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
