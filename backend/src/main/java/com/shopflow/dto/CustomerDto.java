package com.shopflow.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class CustomerDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Integer points;
    private LocalDateTime createdAt;
}
