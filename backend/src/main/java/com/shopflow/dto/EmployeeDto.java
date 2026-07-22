package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class EmployeeDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private BigDecimal salary;
    private String status;
    private LocalDate joiningDate;
    private LocalDateTime createdAt;
}
