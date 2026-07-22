package com.ricebilling.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthRequest {

    public record LoginRequest(
        @NotBlank String username,
        @NotBlank String password
    ) {}

    public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 60) String username,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        String role  // "admin" or "staff"
    ) {}

    public record AuthResponse(
        String token,
        String type,
        Long id,
        String username,
        String email,
        java.util.List<String> roles
    ) {
        public AuthResponse(String token, Long id, String username, String email, java.util.List<String> roles) {
            this(token, "Bearer", id, username, email, roles);
        }
    }
}
