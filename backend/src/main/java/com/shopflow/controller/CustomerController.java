package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    @Autowired private CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<CustomerDto>>> getAll(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(required=false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        if (search != null && !search.isEmpty())
            return ResponseEntity.ok(ApiResponse.success(customerService.searchCustomers(search, pageable), "Success"));
        return ResponseEntity.ok(ApiResponse.success(customerService.getAllCustomers(pageable), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerDto>> create(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.createCustomer(request), "Customer created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDto>> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, request), "Customer updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted"));
    }
}
