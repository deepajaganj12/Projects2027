package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(unique = true)
    private String barcode;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;
    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;
    @Column(nullable = false)
    private Integer stock = 0;
    private String image;
    @Column(nullable = false)
    private boolean active = true;
    @Column(name = "minimum_stock")
    private Integer minimumStock = 10;
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
