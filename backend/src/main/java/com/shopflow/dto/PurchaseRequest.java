package com.shopflow.dto;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class PurchaseRequest {
    @NotNull(message = "Supplier is required")
    private Long supplierId;
    private LocalDate purchaseDate;
    private String invoiceNumber;
    private String notes;
    @NotNull(message = "Items are required")
    private List<PurchaseItemRequest> items;

    @Data @AllArgsConstructor @NoArgsConstructor
    public static class PurchaseItemRequest {
        @NotNull private Long productId;
        @NotNull private Integer quantity;
        @NotNull private BigDecimal unitCost;
    }
}
