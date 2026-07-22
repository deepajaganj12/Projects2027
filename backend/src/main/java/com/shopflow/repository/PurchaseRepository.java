package com.shopflow.repository;
import com.shopflow.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    Page<Purchase> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Purchase> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);
    List<Purchase> findByStatus(String status);

    @Query("SELECT COALESCE(COUNT(p),0) FROM Purchase p WHERE p.status = 'PENDING'")
    Long countPending();

    @Query("SELECT p FROM Purchase p WHERE p.supplier.id = :sid ORDER BY p.createdAt DESC")
    List<Purchase> findBySupplierId(@Param("sid") Long supplierId);
}
