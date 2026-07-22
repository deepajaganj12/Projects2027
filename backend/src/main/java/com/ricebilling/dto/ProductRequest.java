package com.ricebilling.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class ProductRequest {

    public record CreateProductRequest(
        @NotBlank @Size(max = 100) String name,
        String description,
        @NotNull @DecimalMin("0.0") BigDecimal price,
        @NotNull @Min(0) Integer stockQuantity,
        @NotBlank String category,
        String unit,
        Integer lowStockThreshold
    ) {}

    public record UpdateProductRequest(
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String category,
        String unit,
        Integer lowStockThreshold
    ) {}

    public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        String category,
        String unit,
        Integer lowStockThreshold,
        boolean lowStock,
        boolean active
    ) {}
}
