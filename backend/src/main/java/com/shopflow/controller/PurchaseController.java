package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {
    @Autowired private PurchaseService purchaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            purchaseService.getAllPurchases(PageRequest.of(page, size, Sort.by("createdAt").descending())), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseService.getPurchaseById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseDto>> create(@Valid @RequestBody PurchaseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(purchaseService.createPurchase(request), "Purchase order created"));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseDto>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseService.approvePurchase(id), "Purchase approved — stock updated"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<PurchaseDto>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(purchaseService.cancelPurchase(id), "Purchase cancelled"));
    }
}
