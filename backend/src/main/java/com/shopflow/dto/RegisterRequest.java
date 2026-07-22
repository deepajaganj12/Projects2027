package com.shopflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.Set;
@Data
public class RegisterRequest {
    @NotBlank @Size(min=3, max=50) private String name;
    @NotBlank @Size(min=3, max=20) private String username;
    @NotBlank @Email private String email;
    @NotBlank @Size(min=6) private String password;
    private Set<String> roles;
}
