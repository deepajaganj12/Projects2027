package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.*;
import com.shopflow.exception.*;
import com.shopflow.repository.*;
import com.shopflow.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryServiceImpl implements InventoryService {
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductRepository productRepository;

    @Override
    public InventoryDto adjustStock(InventoryRequest request) {
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        int newStock;
        switch (request.getAdjustmentType().toUpperCase()) {
            case "ADD" -> newStock = product.getStock() + request.getQuantity();
            case "REMOVE" -> {
                if (product.getStock() < request.getQuantity())
                    throw new BadRequestException("Insufficient stock");
                newStock = product.getStock() - request.getQuantity();
            }
            case "ADJUSTMENT" -> newStock = request.getQuantity();
            default -> throw new BadRequestException("Invalid adjustment type");
        }
        product.setStock(newStock);
        productRepository.save(product);
        Inventory inv = Inventory.builder().product(product).quantity(request.getQuantity())
            .adjustmentType(request.getAdjustmentType()).notes(request.getNotes())
            .lastUpdated(LocalDateTime.now()).build();
        return mapToDto(inventoryRepository.save(inv));
    }

    @Override
    public List<InventoryDto> getInventoryHistory(Long productId) {
        return inventoryRepository.findByProductIdOrderByLastUpdatedDesc(productId)
            .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<InventoryDto> getAllInventory() {
        return inventoryRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private InventoryDto mapToDto(Inventory inv) {
        return InventoryDto.builder().id(inv.getId())
            .productId(inv.getProduct().getId()).productName(inv.getProduct().getName())
            .quantity(inv.getQuantity()).adjustmentType(inv.getAdjustmentType())
            .notes(inv.getNotes()).lastUpdated(inv.getLastUpdated()).build();
    }
}
