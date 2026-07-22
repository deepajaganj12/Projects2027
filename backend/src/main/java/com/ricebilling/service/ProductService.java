package com.ricebilling.service;

import com.ricebilling.dto.ProductRequest.*;
import com.ricebilling.entity.Product;
import com.ricebilling.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired ProductRepository productRepository;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(name).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getByCategory(String category) {
        return productRepository.findByCategoryAndActiveTrue(category).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getById(Long id) {
        return toResponse(productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found")));
    }

    public ProductResponse create(CreateProductRequest req) {
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setStockQuantity(req.stockQuantity());
        p.setCategory(req.category());
        p.setUnit(req.unit());
        p.setLowStockThreshold(req.lowStockThreshold() != null ? req.lowStockThreshold() : 10);
        return toResponse(productRepository.save(p));
    }

    public ProductResponse update(Long id, UpdateProductRequest req) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (req.name() != null) p.setName(req.name());
        if (req.description() != null) p.setDescription(req.description());
        if (req.price() != null) p.setPrice(req.price());
        if (req.stockQuantity() != null) p.setStockQuantity(req.stockQuantity());
        if (req.category() != null) p.setCategory(req.category());
        if (req.unit() != null) p.setUnit(req.unit());
        if (req.lowStockThreshold() != null) p.setLowStockThreshold(req.lowStockThreshold());
        return toResponse(productRepository.save(p));
    }

    public void delete(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setActive(false);
        productRepository.save(p);
    }

    public ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId(), p.getName(), p.getDescription(), p.getPrice(),
                p.getStockQuantity(), p.getCategory(), p.getUnit(),
                p.getLowStockThreshold(),
                p.getStockQuantity() <= p.getLowStockThreshold(),
                p.isActive());
    }
}
