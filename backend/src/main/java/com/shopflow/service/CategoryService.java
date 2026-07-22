package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;
public interface CategoryService {
    PagedResponse<CategoryDto> getAllCategories(Pageable pageable);
    CategoryDto getCategoryById(Long id);
    CategoryDto createCategory(CategoryRequest request);
    CategoryDto updateCategory(Long id, CategoryRequest request);
    void deleteCategory(Long id);
}
