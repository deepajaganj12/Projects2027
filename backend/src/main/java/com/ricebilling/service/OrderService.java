package com.ricebilling.service;

import com.ricebilling.dto.OrderDto.*;
import com.ricebilling.entity.*;
import com.ricebilling.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired OrderRepository orderRepository;
    @Autowired ProductRepository productRepository;
    @Autowired UserRepository userRepository;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setPaymentType(req.paymentType());
        order.setCustomerName(req.customerName());
        order.setCustomerPhone(req.customerPhone());
        order.setOrderNumber(generateOrderNumber());

        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItemRequest cartItem : req.items()) {
            Product product = productRepository.findById(cartItem.productId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.productId()));

            if (product.getStockQuantity() < cartItem.quantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(cartItem.quantity());
            item.setUnitPrice(product.getPrice());
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.quantity()));
            item.setTotalPrice(itemTotal);
            items.add(item);
            subtotal = subtotal.add(itemTotal);

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.quantity());
            productRepository.save(product);
        }

        order.setItems(items);
        order.setSubtotal(subtotal);
        order.setTax(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);
        order.setStatus(Order.OrderStatus.COMPLETED);

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found")));
    }

    private String generateOrderNumber() {
        return "ORD-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now())
                + "-" + (int)(Math.random() * 1000);
    }

    public OrderResponse toResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getItems().stream().map(item ->
                new OrderItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                )).collect(Collectors.toList());

        return new OrderResponse(
                o.getId(), o.getOrderNumber(), o.getUser().getUsername(),
                itemResponses, o.getSubtotal(), o.getTax(), o.getTotalAmount(),
                o.getPaymentType().name(), o.getStatus().name(),
                o.getCustomerName(), o.getCustomerPhone(), o.getCreatedAt());
    }
}
