package com.ricebilling.service;

import com.ricebilling.dto.DashboardDto;
import com.ricebilling.repository.OrderRepository;
import com.ricebilling.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired OrderRepository orderRepository;
    @Autowired ProductRepository productRepository;

    public DashboardDto getDashboard() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);

        Long totalOrders = orderRepository.totalCompletedOrders();
        Long todayOrders = orderRepository.countOrdersSince(startOfDay);
        BigDecimal totalRevenue = orderRepository.totalRevenue();
        BigDecimal todayRevenue = orderRepository.revenueFrom(startOfDay);
        long totalProducts = productRepository.findByActiveTrue().size();
        long lowStockCount = productRepository.findLowStockProducts().size();

        List<Object[]> rawDaily = orderRepository.dailyRevenue(sevenDaysAgo);
        List<Map<String, Object>> dailySales = new ArrayList<>();
        for (Object[] row : rawDaily) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("date", row[0].toString().substring(0, 10));
            entry.put("revenue", row[1]);
            dailySales.add(entry);
        }

        return new DashboardDto(
                totalOrders == null ? 0 : totalOrders,
                todayOrders == null ? 0 : todayOrders,
                totalRevenue == null ? BigDecimal.ZERO : totalRevenue,
                todayRevenue == null ? BigDecimal.ZERO : todayRevenue,
                totalProducts, lowStockCount, dailySales
        );
    }
}
