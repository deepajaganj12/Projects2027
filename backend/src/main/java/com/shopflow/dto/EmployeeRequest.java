package com.shopflow.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class EmployeeRequest {
    @NotBlank private String name;
    private String email;
    private String phone;
    @NotBlank private String role;
    private BigDecimal salary;
    private String status = "ACTIVE";
    private LocalDate joiningDate;
}
