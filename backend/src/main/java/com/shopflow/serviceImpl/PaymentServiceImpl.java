package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.Payment;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.PaymentRepository;
import com.shopflow.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired private PaymentRepository paymentRepository;

    @Override
    public PagedResponse<PaymentDto> getAllPayments(Pageable pageable) {
        Page<Payment> page = paymentRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<PaymentDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<PaymentDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    @Override
    public PaymentDto getPaymentById(Long id) {
        return mapToDto(paymentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id)));
    }

    private PaymentDto mapToDto(Payment p) {
        return PaymentDto.builder().id(p.getId())
            .orderId(p.getOrder().getId()).orderNumber(p.getOrder().getOrderNumber())
            .amount(p.getAmount()).paymentMethod(p.getPaymentMethod())
            .transactionId(p.getTransactionId()).status(p.getStatus())
            .createdAt(p.getCreatedAt()).build();
    }
}
