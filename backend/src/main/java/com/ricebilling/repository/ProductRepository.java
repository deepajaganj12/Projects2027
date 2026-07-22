package com.ricebilling.repository;

import com.ricebilling.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    List<Product> findByCategoryAndActiveTrue(String category);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity <= p.lowStockThreshold")
    List<Product> findLowStockProducts();

    List<Product> findDistinctCategoriesByActiveTrue();
}
