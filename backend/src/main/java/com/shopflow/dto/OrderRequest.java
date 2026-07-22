package com.shopflow.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
@Data
public class OrderRequest {
    private Long customerId;
    @NotEmpty private List<OrderItemRequest> items;
    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal taxRate = BigDecimal.ZERO;
    @NotBlank private String paymentMethod;
}
