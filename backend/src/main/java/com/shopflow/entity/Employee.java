package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(unique = true)
    private String email;
    private String phone;
    private String role;
    @Column(precision = 10, scale = 2)
    private BigDecimal salary;
    private String status = "ACTIVE";
    @Column(name = "joining_date")
    private LocalDate joiningDate;
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
