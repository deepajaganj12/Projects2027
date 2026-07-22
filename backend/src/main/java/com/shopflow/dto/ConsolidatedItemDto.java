package com.shopflow.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsolidatedItemDto {
    private Long productId;
    private String productName;
    private Integer totalQuantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}
