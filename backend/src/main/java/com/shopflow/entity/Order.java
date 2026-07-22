package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "orders")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_number", unique = true)
    private String orderNumber;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;
    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;
    @Column(precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;
    @Column(name = "grand_total", precision = 10, scale = 2)
    private BigDecimal grandTotal;
    @Column(name = "payment_method")
    private String paymentMethod;
    private String status = "COMPLETED";
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems = new ArrayList<>();
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
