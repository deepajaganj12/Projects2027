package com.ricebilling.repository;

import com.ricebilling.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate")
    Long countOrdersSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal totalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    BigDecimal revenueFrom(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED'")
    Long totalCompletedOrders();

    @Query("SELECT DATE(o.createdAt), SUM(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt) ASC")
    List<Object[]> dailyRevenue(@Param("startDate") LocalDateTime startDate);
}
