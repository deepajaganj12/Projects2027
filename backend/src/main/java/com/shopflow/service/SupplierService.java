package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;

public interface SupplierService {
    PagedResponse<SupplierDto> getAllSuppliers(Pageable pageable);
    SupplierDto getSupplierById(Long id);
    SupplierDto createSupplier(SupplierRequest request);
    SupplierDto updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
}
