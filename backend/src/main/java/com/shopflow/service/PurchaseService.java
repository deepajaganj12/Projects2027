package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;

public interface PurchaseService {
    PagedResponse<PurchaseDto> getAllPurchases(Pageable pageable);
    PurchaseDto getPurchaseById(Long id);
    PurchaseDto createPurchase(PurchaseRequest request);
    PurchaseDto approvePurchase(Long id);   // updates product stock + purchase price
    PurchaseDto cancelPurchase(Long id);
}
