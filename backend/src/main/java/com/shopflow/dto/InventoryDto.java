package com.shopflow.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class InventoryDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer minimumStock;
    private String adjustmentType;
    private String notes;
    private LocalDateTime lastUpdated;
}
