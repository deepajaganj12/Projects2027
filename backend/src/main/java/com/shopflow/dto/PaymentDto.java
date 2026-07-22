package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class PaymentDto {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionId;
    private String status;
    private LocalDateTime createdAt;
}
