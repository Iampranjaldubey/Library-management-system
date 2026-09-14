package com.library.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.dto.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Handles authorization failures for authenticated users (wrong role).
 *
 * Writes a 403 JSON body directly instead of calling response.sendError(),
 * which would trigger a servlet ERROR dispatch to /error and — because that
 * re-dispatch is evaluated as anonymous — surface as a misleading 401.
 */
@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        ApiResponse<Void> body = ApiResponse.error(
                "Forbidden: you do not have permission to access this resource");
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
