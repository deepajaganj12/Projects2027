package com.shopflow.repository;
import com.shopflow.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT COALESCE(SUM(o.grandTotal),0) FROM Order o WHERE o.createdAt >= :start AND o.createdAt < :end AND o.status = 'COMPLETED'")
    BigDecimal sumRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :start AND o.createdAt < :end")
    Long countOrdersBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    List<Order> findTop10ByOrderByCreatedAtDesc();
}
