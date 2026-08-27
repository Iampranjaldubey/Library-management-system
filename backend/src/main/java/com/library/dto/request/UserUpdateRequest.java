package com.library.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Email(message = "Invalid email format")
    private String email;
}
