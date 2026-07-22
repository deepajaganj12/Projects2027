package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class ProductDto {
    private Long id;
    private String name;
    private String barcode;
    private Long categoryId;
    private String categoryName;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private Integer stock;
    private String image;
    private boolean active;
    private Integer minimumStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
