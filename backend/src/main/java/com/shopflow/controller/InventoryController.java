package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    @Autowired private InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InventoryDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllInventory(), "Success"));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryDto>> adjust(@Valid @RequestBody InventoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.adjustStock(request), "Stock adjusted"));
    }

    @GetMapping("/history/{productId}")
    public ResponseEntity<ApiResponse<List<InventoryDto>>> history(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getInventoryHistory(productId), "Success"));
    }
}
