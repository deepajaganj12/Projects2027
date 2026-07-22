package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class DashboardDto {
    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalCustomers;
    private Long lowStockCount;
    private List<Map<String, Object>> revenueChart;
    private List<Map<String, Object>> recentOrders;
    private List<Map<String, Object>> topProducts;
    private List<Map<String, Object>> lowStockProducts;
}
