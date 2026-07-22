package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.BankAccount;
import com.shopflow.entity.BankTransaction;
import com.shopflow.entity.Order;
import com.shopflow.entity.Purchase;
import com.shopflow.exception.BadRequestException;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.BankAccountRepository;
import com.shopflow.repository.BankTransactionRepository;
import com.shopflow.service.BankAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BankAccountServiceImpl implements BankAccountService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private BankTransactionRepository bankTransactionRepository;

    private synchronized void seedDefaultAccounts() {
        if (bankAccountRepository.count() == 0) {
            BankAccount cash = BankAccount.builder()
                .accountName("Cash in hand")
                .accountType("CASH")
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            BankAccount bank = BankAccount.builder()
                .accountName("Unlinked Transactions")
                .accountType("BANK")
                .bankName("Default Bank")
                .balance(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            bankAccountRepository.save(cash);
            bankAccountRepository.save(bank);
        }
    }

    @Override
    @Transactional
    public List<BankAccountDto> getAllAccounts() {
        seedDefaultAccounts();
        return bankAccountRepository.findAll().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BankAccountDto createAccount(BankAccountRequest request) {
        seedDefaultAccounts();
        if (bankAccountRepository.findByAccountName(request.getAccountName()).isPresent()) {
            throw new BadRequestException("Account name already exists: " + request.getAccountName());
        }

        BigDecimal initialBal = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;

        BankAccount a = BankAccount.builder()
            .accountName(request.getAccountName())
            .accountType(request.getAccountType())
            .bankName(request.getBankName())
            .accountNumber(request.getAccountNumber())
            .ifscCode(request.getIfscCode())
            .branchName(request.getBranchName())
            .balance(initialBal)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();

        BankAccount saved = bankAccountRepository.save(a);

        if (initialBal.compareTo(BigDecimal.ZERO) > 0) {
            // Record a deposit transaction for initial balance
            BankTransaction t = BankTransaction.builder()
                .transactionType("CASH_IN")
                .amount(initialBal)
                .transactionDate(LocalDateTime.now())
                .remarks("Initial deposit")
                .referenceType("MANUAL")
                .destinationAccount(saved)
                .createdAt(LocalDateTime.now())
                .build();
            bankTransactionRepository.save(t);
        }

        return mapToDto(saved);
    }

    @Override
    public PagedResponse<BankTransactionDto> getTransactions(int page, int size, String period) {
        seedDefaultAccounts();
        Pageable pageable = PageRequest.of(page, size);
        Page<BankTransaction> transPage;

        LocalDateTime startDate = null;
        if ("30_DAYS".equalsIgnoreCase(period)) {
            startDate = LocalDateTime.now().minusDays(30);
        } else if ("6_MONTHS".equalsIgnoreCase(period)) {
            startDate = LocalDateTime.now().minusMonths(6);
        } else if ("THIS_YEAR".equalsIgnoreCase(period)) {
            startDate = LocalDateTime.of(LocalDateTime.now().getYear(), 1, 1, 0, 0);
        }

        if (startDate != null) {
            transPage = bankTransactionRepository.findByTransactionDateAfterOrderByTransactionDateDesc(startDate, pageable);
        } else {
            transPage = bankTransactionRepository.findAllByOrderByTransactionDateDesc(pageable);
        }

        List<BankTransactionDto> content = transPage.getContent().stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());

        return PagedResponse.<BankTransactionDto>builder()
            .content(content)
            .page(transPage.getNumber())
            .size(transPage.getSize())
            .totalElements(transPage.getTotalElements())
            .totalPages(transPage.getTotalPages())
            .last(transPage.isLast())
            .build();
    }

    @Override
    @Transactional
    public BankTransactionDto addReduceMoney(BankTransactionRequest request) {
        seedDefaultAccounts();
        BankAccount account = bankAccountRepository.findById(request.getAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountId()));

        LocalDateTime tDate = request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now();

        BankTransaction t = BankTransaction.builder()
            .transactionType(request.getTransactionType())
            .amount(request.getAmount())
            .transactionDate(tDate)
            .remarks(request.getRemarks())
            .referenceNumber(request.getReferenceNumber())
            .referenceType("MANUAL")
            .createdAt(LocalDateTime.now())
            .build();

        if ("CASH_IN".equalsIgnoreCase(request.getTransactionType())) {
            account.setBalance(account.getBalance().add(request.getAmount()));
            t.setDestinationAccount(account);
        } else if ("CASH_OUT".equalsIgnoreCase(request.getTransactionType())) {
            account.setBalance(account.getBalance().subtract(request.getAmount()));
            t.setSourceAccount(account);
        } else {
            throw new BadRequestException("Invalid transaction type: " + request.getTransactionType());
        }

        bankAccountRepository.save(account);
        BankTransaction saved = bankTransactionRepository.save(t);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public BankTransactionDto transferMoney(BankTransferRequest request) {
        seedDefaultAccounts();
        if (request.getSourceAccountId().equals(request.getDestinationAccountId())) {
            throw new BadRequestException("Source and Destination accounts must be different");
        }

        BankAccount source = bankAccountRepository.findById(request.getSourceAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Source account not found: " + request.getSourceAccountId()));

        BankAccount destination = bankAccountRepository.findById(request.getDestinationAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Destination account not found: " + request.getDestinationAccountId()));

        LocalDateTime tDate = request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now();

        source.setBalance(source.getBalance().subtract(request.getAmount()));
        destination.setBalance(destination.getBalance().add(request.getAmount()));

        bankAccountRepository.save(source);
        bankAccountRepository.save(destination);

        BankTransaction t = BankTransaction.builder()
            .transactionType("TRANSFER")
            .amount(request.getAmount())
            .transactionDate(tDate)
            .remarks(request.getRemarks() != null ? request.getRemarks() : "Fund transfer")
            .referenceType("MANUAL")
            .sourceAccount(source)
            .destinationAccount(destination)
            .createdAt(LocalDateTime.now())
            .build();

        BankTransaction saved = bankTransactionRepository.save(t);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void recordOrderPayment(Order order) {
        seedDefaultAccounts();
        BankAccount account;
        if ("CASH".equalsIgnoreCase(order.getPaymentMethod())) {
            account = bankAccountRepository.findByAccountName("Cash in hand")
                .orElseGet(() -> bankAccountRepository.findAll().stream()
                    .filter(a -> "CASH".equalsIgnoreCase(a.getAccountType()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No CASH account found")));
        } else {
            account = bankAccountRepository.findByAccountName("Unlinked Transactions")
                .orElseGet(() -> bankAccountRepository.findAll().stream()
                    .filter(a -> "BANK".equalsIgnoreCase(a.getAccountType()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No BANK account found")));
        }

        account.setBalance(account.getBalance().add(order.getGrandTotal()));
        bankAccountRepository.save(account);

        BankTransaction t = BankTransaction.builder()
            .transactionType("CASH_IN")
            .amount(order.getGrandTotal())
            .transactionDate(order.getCreatedAt())
            .remarks("POS Sale: " + order.getOrderNumber())
            .referenceNumber(order.getOrderNumber())
            .referenceType("ORDER")
            .referenceId(order.getId())
            .destinationAccount(account)
            .createdAt(LocalDateTime.now())
            .build();

        bankTransactionRepository.save(t);
    }

    @Override
    @Transactional
    public void recordPurchasePayment(Purchase purchase) {
        seedDefaultAccounts();
        BankAccount account = bankAccountRepository.findByAccountName("Cash in hand")
            .orElseGet(() -> bankAccountRepository.findAll().stream()
                .filter(a -> "CASH".equalsIgnoreCase(a.getAccountType()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No CASH account found")));

        account.setBalance(account.getBalance().subtract(purchase.getTotalAmount()));
        bankAccountRepository.save(account);

        BankTransaction t = BankTransaction.builder()
            .transactionType("CASH_OUT")
            .amount(purchase.getTotalAmount())
            .transactionDate(purchase.getUpdatedAt() != null ? purchase.getUpdatedAt() : LocalDateTime.now())
            .remarks("Approved Purchase: " + purchase.getPurchaseNumber())
            .referenceNumber(purchase.getPurchaseNumber())
            .referenceType("PURCHASE")
            .referenceId(purchase.getId())
            .sourceAccount(account)
            .createdAt(LocalDateTime.now())
            .build();

        bankTransactionRepository.save(t);
    }

    private BankAccountDto mapToDto(BankAccount a) {
        if (a == null) return null;
        return BankAccountDto.builder()
            .id(a.getId())
            .accountName(a.getAccountName())
            .accountType(a.getAccountType())
            .bankName(a.getBankName())
            .accountNumber(a.getAccountNumber())
            .ifscCode(a.getIfscCode())
            .branchName(a.getBranchName())
            .balance(a.getBalance())
            .createdAt(a.getCreatedAt())
            .updatedAt(a.getUpdatedAt())
            .build();
    }

    private BankTransactionDto mapToDto(BankTransaction t) {
        if (t == null) return null;
        return BankTransactionDto.builder()
            .id(t.getId())
            .transactionType(t.getTransactionType())
            .amount(t.getAmount())
            .transactionDate(t.getTransactionDate())
            .remarks(t.getRemarks())
            .referenceNumber(t.getReferenceNumber())
            .referenceType(t.getReferenceType())
            .referenceId(t.getReferenceId())
            .sourceAccount(mapToDto(t.getSourceAccount()))
            .destinationAccount(mapToDto(t.getDestinationAccount()))
            .createdAt(t.getCreatedAt())
            .build();
    }
}
