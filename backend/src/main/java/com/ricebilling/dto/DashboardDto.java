package com.ricebilling.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardDto(
    Long totalOrders,
    Long todayOrders,
    BigDecimal totalRevenue,
    BigDecimal todayRevenue,
    Long totalProducts,
    Long lowStockCount,
    List<Map<String, Object>> dailySales
) {}
