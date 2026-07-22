package com.shopflow.dto;
import lombok.*;
import java.time.LocalDateTime;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class SupplierDto {
    private Long id;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private String gstin;
    private String company;
    private String status;
    private LocalDateTime createdAt;
}
