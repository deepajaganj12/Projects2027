package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class OrderItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
}
