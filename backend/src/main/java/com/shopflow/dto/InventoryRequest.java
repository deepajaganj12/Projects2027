package com.shopflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class InventoryRequest {
    @NotNull private Long productId;
    @NotNull private Integer quantity;
    @NotBlank private String adjustmentType; // ADD, REMOVE, ADJUSTMENT
    private String notes;
}
