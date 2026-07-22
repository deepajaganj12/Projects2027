package com.shopflow.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BankAccountDto {
    private Long id;
    private String accountName;
    private String accountType;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String branchName;
    private BigDecimal balance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
