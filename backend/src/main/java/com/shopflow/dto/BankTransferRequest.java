package com.shopflow.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BankTransferRequest {
    @NotNull(message = "Source account ID is required")
    private Long sourceAccountId;

    @NotNull(message = "Destination account ID is required")
    private Long destinationAccountId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String remarks;
    private LocalDateTime transactionDate;
}
