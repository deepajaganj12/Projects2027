package com.shopflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class OrderItemRequest {
    @NotNull private Long productId;
    @NotNull @Min(1) private Integer quantity;
    @NotNull private BigDecimal price;
}
