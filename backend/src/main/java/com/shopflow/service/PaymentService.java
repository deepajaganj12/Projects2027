package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;
public interface PaymentService {
    PagedResponse<PaymentDto> getAllPayments(Pageable pageable);
    PaymentDto getPaymentById(Long id);
}
