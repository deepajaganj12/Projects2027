package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.*;
import com.shopflow.exception.*;
import com.shopflow.repository.*;
import com.shopflow.service.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {
    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ModelMapper modelMapper;

    @Override
    public PagedResponse<ProductDto> getAllProducts(Pageable pageable) {
        Page<Product> page = productRepository.findByActiveTrue(pageable);
        return buildPagedResponse(page);
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        return mapToDto(product);
    }

    @Override
    public ProductDto createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setBarcode(request.getBarcode());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setStock(request.getStock());
        product.setImage(request.getImage());
        product.setActive(request.isActive());
        product.setMinimumStock(request.getMinimumStock());
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
        return mapToDto(productRepository.save(product));
    }

    @Override
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setName(request.getName());
        product.setBarcode(request.getBarcode());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setStock(request.getStock());
        product.setImage(request.getImage());
        product.setActive(request.isActive());
        product.setMinimumStock(request.getMinimumStock());
        product.setUpdatedAt(LocalDateTime.now());
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }
        return mapToDto(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    public PagedResponse<ProductDto> searchProducts(String query, Pageable pageable) {
        Page<Product> page = productRepository.findByActiveTrueAndNameContainingIgnoreCase(query, pageable);
        return buildPagedResponse(page);
    }

    @Override
    public PagedResponse<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> page = productRepository.findByActiveTrueAndCategoryId(categoryId, pageable);
        return buildPagedResponse(page);
    }

    @Override
    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> searchForPOS(String query) {
        return productRepository.searchProducts(query).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId()); dto.setName(product.getName());
        dto.setBarcode(product.getBarcode()); dto.setSellingPrice(product.getSellingPrice());
        dto.setPurchasePrice(product.getPurchasePrice()); dto.setStock(product.getStock());
        dto.setImage(product.getImage()); dto.setActive(product.isActive());
        dto.setMinimumStock(product.getMinimumStock());
        dto.setCreatedAt(product.getCreatedAt()); dto.setUpdatedAt(product.getUpdatedAt());
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        return dto;
    }

    private PagedResponse<ProductDto> buildPagedResponse(Page<Product> page) {
        List<ProductDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<ProductDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }
}
