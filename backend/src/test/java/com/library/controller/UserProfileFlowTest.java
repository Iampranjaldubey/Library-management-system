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

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies GET /api/v1/users/profile returns the authenticated caller's own
 * profile and is closed to anonymous requests. Runs against a real container.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UserProfileFlowTest {

    @Autowired private TestRestTemplate rest;
    @Autowired private ObjectMapper     objectMapper;

    @Test
    void profileReturnsTheAuthenticatedUsersDetails() throws Exception {
        String email = "profile-" + UUID.randomUUID() + "@example.com";

        HttpHeaders json = new HttpHeaders();
        json.setContentType(MediaType.APPLICATION_JSON);
        String body = "{\"name\":\"Profile Tester\",\"email\":\"" + email
                + "\",\"password\":\"Passw0rd!23\"}";
        ResponseEntity<String> register = rest.postForEntity(
                "/api/v1/auth/register", new HttpEntity<>(body, json), String.class);
        assertThat(register.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        String token = objectMapper.readTree(register.getBody()).path("data").path("token").asText();
        assertThat(token).isNotBlank();

        HttpHeaders auth = new HttpHeaders();
        auth.setBearerAuth(token);
        ResponseEntity<String> resp = rest.exchange(
                "/api/v1/users/profile", HttpMethod.GET, new HttpEntity<>(auth), String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode data = objectMapper.readTree(resp.getBody()).path("data");
        assertThat(data.path("email").asText()).isEqualTo(email);
        assertThat(data.path("name").asText()).isEqualTo("Profile Tester");
        assertThat(data.path("role").asText()).isEqualTo("USER");
        assertThat(data.path("memberId").asText()).startsWith("LIB-");
    }

    @Test
    void profileRequiresAuthentication() {
        ResponseEntity<String> resp = rest.exchange(
                "/api/v1/users/profile", HttpMethod.GET, HttpEntity.EMPTY, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
