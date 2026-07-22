package com.shopflow.service;

import com.shopflow.dto.*;
import com.shopflow.entity.Order;
import com.shopflow.entity.Purchase;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface BankAccountService {
    List<BankAccountDto> getAllAccounts();
    BankAccountDto createAccount(BankAccountRequest request);
    PagedResponse<BankTransactionDto> getTransactions(int page, int size, String period);
    BankTransactionDto addReduceMoney(BankTransactionRequest request);
    BankTransactionDto transferMoney(BankTransferRequest request);
    void recordOrderPayment(Order order);
    void recordPurchasePayment(Purchase purchase);
}
