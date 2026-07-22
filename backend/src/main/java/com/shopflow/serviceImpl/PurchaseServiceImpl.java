package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.*;
import com.shopflow.exception.*;
import com.shopflow.repository.*;
import com.shopflow.service.PurchaseService;
import com.shopflow.service.BankAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseServiceImpl implements PurchaseService {
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private BankAccountService bankAccountService;

    @Override
    public PagedResponse<PurchaseDto> getAllPurchases(Pageable pageable) {
        Page<Purchase> page = purchaseRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<PurchaseDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<PurchaseDto>builder()
            .content(content).page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .last(page.isLast()).build();
    }

    @Override
    public PurchaseDto getPurchaseById(Long id) {
        return mapToDto(purchaseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + id)));
    }

    @Override
    @Transactional
    public PurchaseDto createPurchase(PurchaseRequest req) {
        Supplier supplier = supplierRepository.findById(req.getSupplierId())
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + req.getSupplierId()));

        String purchaseNumber = "PO-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());

        Purchase purchase = Purchase.builder()
            .purchaseNumber(purchaseNumber)
            .supplier(supplier)
            .purchaseDate(req.getPurchaseDate() != null ? req.getPurchaseDate() : LocalDate.now())
            .invoiceNumber(req.getInvoiceNumber())
            .notes(req.getNotes())
            .status("PENDING")
            .totalAmount(BigDecimal.ZERO)
            .build();

        // Build items
        List<PurchaseItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseRequest.PurchaseItemRequest ir : req.getItems()) {
            Product product = productRepository.findById(ir.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + ir.getProductId()));
            BigDecimal lineTotal = ir.getUnitCost().multiply(BigDecimal.valueOf(ir.getQuantity()));
            PurchaseItem item = PurchaseItem.builder()
                .purchase(purchase)
                .product(product)
                .quantity(ir.getQuantity())
                .unitCost(ir.getUnitCost())
                .totalCost(lineTotal)
                .build();
            items.add(item);
            total = total.add(lineTotal);
        }
        purchase.setItems(items);
        purchase.setTotalAmount(total);
        return mapToDto(purchaseRepository.save(purchase));
    }

    @Override
    @Transactional
    public PurchaseDto approvePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + id));
        if (!"PENDING".equals(purchase.getStatus()))
            throw new BadRequestException("Only PENDING purchases can be approved");

        // Update product stock and purchase price for each item
        for (PurchaseItem item : purchase.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            product.setPurchasePrice(item.getUnitCost()); // update latest purchase price
            productRepository.save(product);

            // Log in inventory history
            Inventory inv = Inventory.builder()
                .product(product)
                .quantity(item.getQuantity())
                .adjustmentType("ADD")
                .notes("Purchase approved: " + purchase.getPurchaseNumber() +
                       " | Supplier: " + purchase.getSupplier().getName())
                .lastUpdated(LocalDateTime.now())
                .build();
            inventoryRepository.save(inv);
        }

        purchase.setStatus("APPROVED");
        try {
            bankAccountService.recordPurchasePayment(purchase);
        } catch (Exception e) {
            // Log or ignore to prevent breaking the purchase transaction
        }
        return mapToDto(purchaseRepository.save(purchase));
    }

    @Override
    @Transactional
    public PurchaseDto cancelPurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + id));
        if ("APPROVED".equals(purchase.getStatus()))
            throw new BadRequestException("Approved purchases cannot be cancelled");
        purchase.setStatus("CANCELLED");
        return mapToDto(purchaseRepository.save(purchase));
    }

    private PurchaseDto mapToDto(Purchase p) {
        List<PurchaseItemDto> itemDtos = p.getItems() == null ? List.of() :
            p.getItems().stream().map(i -> PurchaseItemDto.builder()
                .id(i.getId())
                .productId(i.getProduct().getId())
                .productName(i.getProduct().getName())
                .productBarcode(i.getProduct().getBarcode())
                .categoryName(i.getProduct().getCategory() != null ? i.getProduct().getCategory().getName() : null)
                .quantity(i.getQuantity())
                .unitCost(i.getUnitCost())
                .totalCost(i.getTotalCost())
                .build()).collect(Collectors.toList());

        return PurchaseDto.builder()
            .id(p.getId())
            .purchaseNumber(p.getPurchaseNumber())
            .supplierId(p.getSupplier().getId())
            .supplierName(p.getSupplier().getName())
            .supplierPhone(p.getSupplier().getPhone())
            .supplierCompany(p.getSupplier().getCompany())
            .purchaseDate(p.getPurchaseDate())
            .invoiceNumber(p.getInvoiceNumber())
            .totalAmount(p.getTotalAmount())
            .status(p.getStatus())
            .notes(p.getNotes())
            .items(itemDtos)
            .createdAt(p.getCreatedAt())
            .build();
    }
}
