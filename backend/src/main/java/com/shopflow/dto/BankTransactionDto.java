package com.shopflow.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BankTransactionDto {
    private Long id;
    private String transactionType;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String remarks;
    private String referenceNumber;
    private String referenceType;
    private Long referenceId;
    private BankAccountDto sourceAccount;
    private BankAccountDto destinationAccount;
    private LocalDateTime createdAt;
}
