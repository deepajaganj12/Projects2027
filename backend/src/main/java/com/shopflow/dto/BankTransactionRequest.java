package com.shopflow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BankTransactionRequest {
    @NotNull(message = "Transaction type is required")
    private String transactionType; // "CASH_IN" or "CASH_OUT"

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Account ID is required")
    private Long accountId;

    private String remarks;
    private String referenceNumber;
    private LocalDateTime transactionDate;
}
