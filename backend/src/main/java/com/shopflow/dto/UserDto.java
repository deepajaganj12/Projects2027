package com.shopflow.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class UserDto {
    private Long id;
    private String name;
    private String username;
    private String email;
    private boolean active;
    private List<String> roles;
    private LocalDateTime createdAt;
}
