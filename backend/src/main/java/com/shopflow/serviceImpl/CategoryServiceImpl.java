package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.Category;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {
    @Autowired private CategoryRepository categoryRepository;

    @Override
    public PagedResponse<CategoryDto> getAllCategories(Pageable pageable) {
        Page<Category> page = categoryRepository.findAll(pageable);
        List<CategoryDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<CategoryDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        return mapToDto(categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id)));
    }

    @Override
    public CategoryDto createCategory(CategoryRequest request) {
        Category c = Category.builder().name(request.getName()).description(request.getDescription()).build();
        return mapToDto(categoryRepository.save(c));
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryRequest request) {
        Category c = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
        c.setName(request.getName()); c.setDescription(request.getDescription());
        return mapToDto(categoryRepository.save(c));
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) throw new ResourceNotFoundException("Category not found: " + id);
        categoryRepository.deleteById(id);
    }

    private CategoryDto mapToDto(Category c) {
        return CategoryDto.builder().id(c.getId()).name(c.getName())
            .description(c.getDescription()).createdAt(c.getCreatedAt()).build();
    }
}
