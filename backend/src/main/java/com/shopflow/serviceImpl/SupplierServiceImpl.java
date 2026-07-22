package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.Supplier;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.SupplierRepository;
import com.shopflow.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierServiceImpl implements SupplierService {
    @Autowired private SupplierRepository supplierRepository;

    @Override
    public PagedResponse<SupplierDto> getAllSuppliers(Pageable pageable) {
        Page<Supplier> page = supplierRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<SupplierDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<SupplierDto>builder()
            .content(content).page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .last(page.isLast()).build();
    }

    @Override
    public SupplierDto getSupplierById(Long id) {
        return mapToDto(supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id)));
    }

    @Override
    public SupplierDto createSupplier(SupplierRequest req) {
        Supplier s = Supplier.builder()
            .name(req.getName()).contactPerson(req.getContactPerson())
            .phone(req.getPhone()).email(req.getEmail())
            .address(req.getAddress()).gstin(req.getGstin())
            .company(req.getCompany()).status(req.getStatus() != null ? req.getStatus() : "ACTIVE")
            .build();
        return mapToDto(supplierRepository.save(s));
    }

    @Override
    public SupplierDto updateSupplier(Long id, SupplierRequest req) {
        Supplier s = supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
        s.setName(req.getName()); s.setContactPerson(req.getContactPerson());
        s.setPhone(req.getPhone()); s.setEmail(req.getEmail());
        s.setAddress(req.getAddress()); s.setGstin(req.getGstin());
        s.setCompany(req.getCompany()); s.setStatus(req.getStatus());
        return mapToDto(supplierRepository.save(s));
    }

    @Override
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id))
            throw new ResourceNotFoundException("Supplier not found: " + id);
        supplierRepository.deleteById(id);
    }

    private SupplierDto mapToDto(Supplier s) {
        return SupplierDto.builder()
            .id(s.getId()).name(s.getName()).contactPerson(s.getContactPerson())
            .phone(s.getPhone()).email(s.getEmail()).address(s.getAddress())
            .gstin(s.getGstin()).company(s.getCompany()).status(s.getStatus())
            .createdAt(s.getCreatedAt()).build();
    }
}
