package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.Customer;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.CustomerRepository;
import com.shopflow.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {
    @Autowired private CustomerRepository customerRepository;

    @Override
    public PagedResponse<CustomerDto> getAllCustomers(Pageable pageable) {
        Page<Customer> page = customerRepository.findAll(pageable);
        List<CustomerDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<CustomerDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    @Override public CustomerDto getCustomerById(Long id) {
        return mapToDto(customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id)));
    }

    @Override public CustomerDto createCustomer(CustomerRequest request) {
        Customer c = Customer.builder().name(request.getName()).email(request.getEmail())
            .phone(request.getPhone()).address(request.getAddress()).points(0).build();
        return mapToDto(customerRepository.save(c));
    }

    @Override public CustomerDto updateCustomer(Long id, CustomerRequest request) {
        Customer c = customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        c.setName(request.getName()); c.setEmail(request.getEmail());
        c.setPhone(request.getPhone()); c.setAddress(request.getAddress());
        return mapToDto(customerRepository.save(c));
    }

    @Override public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) throw new ResourceNotFoundException("Customer not found: " + id);
        customerRepository.deleteById(id);
    }

    @Override public PagedResponse<CustomerDto> searchCustomers(String query, Pageable pageable) {
        Page<Customer> page = customerRepository.findByNameContainingIgnoreCase(query, pageable);
        List<CustomerDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<CustomerDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    private CustomerDto mapToDto(Customer c) {
        return CustomerDto.builder().id(c.getId()).name(c.getName()).email(c.getEmail())
            .phone(c.getPhone()).address(c.getAddress()).points(c.getPoints()).createdAt(c.getCreatedAt()).build();
    }
}
