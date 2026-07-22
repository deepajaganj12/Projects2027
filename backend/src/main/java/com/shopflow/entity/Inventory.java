package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    @Column(name = "quantity")
    private Integer quantity;
    @Column(name = "minimum_stock")
    private Integer minimumStock = 10;
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated = LocalDateTime.now();
    @Column(name = "adjustment_type")
    private String adjustmentType; // ADD, REMOVE, ADJUSTMENT
    private String notes;
}
