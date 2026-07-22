package com.ricebilling.dto;

import com.ricebilling.entity.Order;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    public record CartItemRequest(
        @NotNull Long productId,
        @NotNull Integer quantity
    ) {}

    public record CreateOrderRequest(
        @NotEmpty List<CartItemRequest> items,
        @NotNull Order.PaymentType paymentType,
        String customerName,
        String customerPhone
    ) {}

    public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal totalPrice
    ) {}

    public record OrderResponse(
        Long id,
        String orderNumber,
        String username,
        List<OrderItemResponse> items,
        BigDecimal subtotal,
        BigDecimal tax,
        BigDecimal totalAmount,
        String paymentType,
        String status,
        String customerName,
        String customerPhone,
        LocalDateTime createdAt
    ) {}
}
