package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> getAll(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(pageable), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.createProduct(request), "Product created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, request), "Product updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> search(
            @RequestParam String query,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            productService.searchProducts(query, PageRequest.of(page, size)), "Success"));
    }

    @GetMapping("/pos/search")
    public ResponseEntity<ApiResponse<List<ProductDto>>> posSearch(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchForPOS(query), "Success"));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductDto>>> lowStock() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStockProducts(), "Success"));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> byCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue="0") int page,
            @RequestParam(defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            productService.getProductsByCategory(categoryId, PageRequest.of(page, size)), "Success"));
    }
}
