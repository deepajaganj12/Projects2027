package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_transactions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class BankTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "CASH_IN", "CASH_OUT", "TRANSFER"
    @Column(name = "transaction_type", nullable = false)
    private String transactionType;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate = LocalDateTime.now();

    private String remarks;

    @Column(name = "reference_number")
    private String referenceNumber;

    // "MANUAL", "ORDER", "PURCHASE"
    @Column(name = "reference_type")
    private String referenceType = "MANUAL";

    @Column(name = "reference_id")
    private Long referenceId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_account_id")
    private BankAccount sourceAccount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_account_id")
    private BankAccount destinationAccount;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
