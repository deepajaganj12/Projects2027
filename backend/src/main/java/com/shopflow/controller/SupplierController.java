package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {
    @Autowired private SupplierService supplierService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<SupplierDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            supplierService.getAllSuppliers(PageRequest.of(page, size)), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> create(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.createSupplier(request), "Supplier created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> update(
            @PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.updateSupplier(id, request), "Supplier updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted"));
    }
}
