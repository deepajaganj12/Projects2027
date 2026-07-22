package com.shopflow.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor @Builder
public class PurchaseDto {
    private Long id;
    private String purchaseNumber;
    private Long supplierId;
    private String supplierName;
    private String supplierPhone;
    private String supplierCompany;
    private LocalDate purchaseDate;
    private String invoiceNumber;
    private BigDecimal totalAmount;
    private String status;
    private String notes;
    private List<PurchaseItemDto> items;
    private LocalDateTime createdAt;
}
