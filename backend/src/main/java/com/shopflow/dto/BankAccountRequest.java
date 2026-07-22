package com.shopflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BankAccountRequest {
    @NotBlank(message = "Account name is required")
    private String accountName;

    @NotBlank(message = "Account type is required")
    private String accountType; // "CASH" or "BANK"

    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String branchName;
    private BigDecimal initialBalance;
}
