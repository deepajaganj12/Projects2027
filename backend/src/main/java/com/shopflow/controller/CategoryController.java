package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CategoryDto>>> getAll(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="100") int size) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories(PageRequest.of(page, size)), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDto>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.createCategory(request), "Category created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.updateCategory(id, request), "Category updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted"));
    }
}
