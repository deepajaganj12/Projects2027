package com.shopflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class ProductRequest {
    @NotBlank private String name;
    private String barcode;
    private Long categoryId;
    private BigDecimal purchasePrice;
    @NotNull private BigDecimal sellingPrice;
    @NotNull @Min(0) private Integer stock;
    private String image;
    private Integer minimumStock = 10;
    private boolean active = true;
}
