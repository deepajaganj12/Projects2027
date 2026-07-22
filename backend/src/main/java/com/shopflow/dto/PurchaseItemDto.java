package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class PurchaseItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productBarcode;
    private String categoryName;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
}
