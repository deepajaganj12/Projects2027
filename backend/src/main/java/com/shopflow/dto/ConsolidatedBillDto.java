package com.shopflow.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ConsolidatedBillDto {
    private Long totalOrders;
    private List<String> orderNumbers;
    private List<ConsolidatedItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal grandTotal;
    private Map<String, BigDecimal> paymentMethodBreakdown;
    private LocalDate date;
}
