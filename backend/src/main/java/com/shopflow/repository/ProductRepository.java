package com.shopflow.repository;
import com.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
    List<Product> findByActiveTrue();
    Optional<Product> findByBarcode(String barcode);
    Page<Product> findByActiveTrueAndNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Product> findByActiveTrueAndCategoryId(Long categoryId, Pageable pageable);
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stock <= p.minimumStock")
    List<Product> findLowStockProducts();
    @Query("SELECT p FROM Product p WHERE p.active = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR p.barcode LIKE CONCAT('%', :query, '%'))")
    List<Product> searchProducts(String query);
}
