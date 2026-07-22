package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface ProductService {
    PagedResponse<ProductDto> getAllProducts(Pageable pageable);
    ProductDto getProductById(Long id);
    ProductDto createProduct(ProductRequest request);
    ProductDto updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    PagedResponse<ProductDto> searchProducts(String query, Pageable pageable);
    PagedResponse<ProductDto> getProductsByCategory(Long categoryId, Pageable pageable);
    List<ProductDto> getLowStockProducts();
    List<ProductDto> searchForPOS(String query);
}
