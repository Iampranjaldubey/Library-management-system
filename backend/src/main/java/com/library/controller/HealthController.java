package com.library.controller;

import com.library.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public liveness endpoint used by the platform health check (Render
 * {@code healthCheckPath}) and for uptime pings that keep a free-tier
 * instance warm. Intentionally unauthenticated and dependency-free.
 */
@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health", description = "Liveness probe")
public class HealthController {

    @GetMapping
    @Operation(summary = "Liveness check",
               description = "Returns 200 while the service is up. No authentication required.")
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(ApiResponse.success("Service is up", Map.of("status", "UP")));
    }
}
