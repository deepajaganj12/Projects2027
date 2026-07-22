package com.shopflow.repository;

import com.shopflow.entity.BankTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    Page<BankTransaction> findAllByOrderByTransactionDateDesc(Pageable pageable);
    
    Page<BankTransaction> findByTransactionDateAfterOrderByTransactionDateDesc(LocalDateTime date, Pageable pageable);
}
