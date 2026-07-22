package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;
public interface OrderService {
    OrderDto createOrder(OrderRequest request, String username);
    OrderDto getOrderById(Long id);
    PagedResponse<OrderDto> getAllOrders(Pageable pageable);
    OrderDto cancelOrder(Long id);
    ConsolidatedBillDto getConsolidatedBillForDate(java.time.LocalDate date);
}
