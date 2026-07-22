package com.shopflow.serviceImpl;

import com.shopflow.dto.DashboardDto;
import com.shopflow.entity.Order;
import com.shopflow.repository.*;
import com.shopflow.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Service
public class DashboardServiceImpl implements DashboardService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private OrderItemRepository orderItemRepository;

    @Override
    public DashboardDto getDashboardData() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        BigDecimal todayRevenue = orderRepository.sumRevenueBetween(todayStart, todayEnd);
        BigDecimal monthlyRevenue = orderRepository.sumRevenueBetween(monthStart, todayEnd);

        // Build revenue chart (last 7 days)
        List<Map<String, Object>> revenueChart = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = LocalDate.now().minusDays(i).atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);
            BigDecimal revenue = orderRepository.sumRevenueBetween(dayStart, dayEnd);
            Map<String, Object> data = new HashMap<>();
            data.put("date", LocalDate.now().minusDays(i).toString());
            data.put("revenue", revenue);
            data.put("orders", orderRepository.countOrdersBetween(dayStart, dayEnd));
            revenueChart.add(data);
        }

        // Recent orders
        List<Map<String, Object>> recentOrders = new ArrayList<>();
        for (Order o : orderRepository.findTop10ByOrderByCreatedAtDesc()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", o.getId()); m.put("orderNumber", o.getOrderNumber());
            m.put("customer", o.getCustomer() != null ? o.getCustomer().getName() : "Walk-in");
            m.put("total", o.getGrandTotal()); m.put("status", o.getStatus());
            m.put("date", o.getCreatedAt()); m.put("paymentMethod", o.getPaymentMethod());
            recentOrders.add(m);
        }

        // Top products
        List<Map<String, Object>> topProducts = new ArrayList<>();
        List<Object[]> topSelling = orderItemRepository.findTopSellingProducts();
        for (int i = 0; i < Math.min(5, topSelling.size()); i++) {
            Object[] row = topSelling.get(i);
            Map<String, Object> m = new HashMap<>();
            m.put("name", row[0]); m.put("quantity", row[1]);
            topProducts.add(m);
        }

        // Low stock
        List<Map<String, Object>> lowStock = new ArrayList<>();
        productRepository.findLowStockProducts().forEach(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId()); m.put("name", p.getName());
            m.put("stock", p.getStock()); m.put("minimumStock", p.getMinimumStock());
            lowStock.add(m);
        });

        return DashboardDto.builder()
            .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
            .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
            .totalOrders(orderRepository.count())
            .totalProducts(productRepository.count())
            .totalCustomers(customerRepository.count())
            .lowStockCount((long) productRepository.findLowStockProducts().size())
            .revenueChart(revenueChart)
            .recentOrders(recentOrders)
            .topProducts(topProducts)
            .lowStockProducts(lowStock)
            .build();
    }
}
