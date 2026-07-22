package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;
public interface CustomerService {
    PagedResponse<CustomerDto> getAllCustomers(Pageable pageable);
    CustomerDto getCustomerById(Long id);
    CustomerDto createCustomer(CustomerRequest request);
    CustomerDto updateCustomer(Long id, CustomerRequest request);
    void deleteCustomer(Long id);
    PagedResponse<CustomerDto> searchCustomers(String query, Pageable pageable);
}
