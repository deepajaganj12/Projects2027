package com.shopflow.service;
import com.shopflow.dto.*;
import java.util.List;
public interface InventoryService {
    InventoryDto adjustStock(InventoryRequest request);
    List<InventoryDto> getInventoryHistory(Long productId);
    List<InventoryDto> getAllInventory();
}
