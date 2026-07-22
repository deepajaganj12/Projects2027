package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    @Autowired private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PaymentDto>>> getAll(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            paymentService.getAllPayments(PageRequest.of(page, size)), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPaymentById(id), "Success"));
    }
}
