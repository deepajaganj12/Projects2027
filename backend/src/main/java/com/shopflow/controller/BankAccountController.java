package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.BankAccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-accounts")
public class BankAccountController {

    @Autowired
    private BankAccountService bankAccountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BankAccountDto>>> getAllAccounts() {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.getAllAccounts(), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BankAccountDto>> createAccount(@Valid @RequestBody BankAccountRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.createAccount(request), "Success"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PagedResponse<BankTransactionDto>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String period) {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.getTransactions(page, size, period), "Success"));
    }

    @PostMapping("/transaction")
    public ResponseEntity<ApiResponse<BankTransactionDto>> addReduceMoney(@Valid @RequestBody BankTransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.addReduceMoney(request), "Success"));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<BankTransactionDto>> transferMoney(@Valid @RequestBody BankTransferRequest request) {
        return ResponseEntity.ok(ApiResponse.success(bankAccountService.transferMoney(request), "Success"));
    }
}
