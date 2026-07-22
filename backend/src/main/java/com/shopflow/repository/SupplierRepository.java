package com.shopflow.repository;
import com.shopflow.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Page<Supplier> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "OR LOWER(s.phone) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "OR LOWER(s.company) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Supplier> search(@Param("q") String q);

    List<Supplier> findByStatus(String status);
}
