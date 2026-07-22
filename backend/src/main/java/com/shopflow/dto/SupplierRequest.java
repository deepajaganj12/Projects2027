package com.shopflow.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class SupplierRequest {
    @NotBlank(message = "Supplier name is required")
    private String name;
    private String contactPerson;
    @NotBlank(message = "Phone is required")
    private String phone;
    private String email;
    private String address;
    private String gstin;
    private String company;
    private String status = "ACTIVE";
}
