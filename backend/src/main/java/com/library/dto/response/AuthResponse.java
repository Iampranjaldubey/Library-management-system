package com.library.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.library.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Once the refresh token moved to an HttpOnly cookie, its body field is nulled;
// NON_NULL keeps it (and any other empty field) out of the serialized response.
@JsonInclude(JsonInclude.Include.NON_NULL)
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    @Builder.Default
    private String type = "Bearer";
    private Long   id;
    private String name;
    private String email;
    private Role   role;
}
