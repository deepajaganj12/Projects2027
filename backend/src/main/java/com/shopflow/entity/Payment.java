package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
    @Column(name = "payment_method")
    private String paymentMethod;
    @Column(name = "transaction_id")
    private String transactionId;
    private String status = "SUCCESS";
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
