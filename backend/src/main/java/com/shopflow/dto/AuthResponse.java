package com.shopflow.dto;
import lombok.*;
import java.util.List;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String name;
    private List<String> roles;
}
