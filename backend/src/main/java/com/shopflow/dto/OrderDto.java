package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long userId;
    private String userName;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal grandTotal;
    private String paymentMethod;
    private String status;
    private List<OrderItemDto> orderItems;
    private LocalDateTime createdAt;
}
