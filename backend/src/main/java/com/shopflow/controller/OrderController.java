package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.security.UserDetailsImpl;
import com.shopflow.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired private OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderDto>>> getAll(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            orderService.getAllOrders(PageRequest.of(page, size, Sort.by("createdAt").descending())), "Success"));
    }

    @GetMapping("/today-consolidated")
    public ResponseEntity<ApiResponse<ConsolidatedBillDto>> getTodayConsolidated(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getConsolidatedBillForDate(date), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> create(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
            orderService.createOrder(request, userDetails.getUsername()), "Order created"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderDto>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.cancelOrder(id), "Order cancelled"));
    }
}
