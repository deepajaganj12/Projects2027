package com.shopflow.service;
import com.shopflow.dto.*;
import org.springframework.data.domain.Pageable;
public interface EmployeeService {
    PagedResponse<EmployeeDto> getAllEmployees(Pageable pageable);
    EmployeeDto getEmployeeById(Long id);
    EmployeeDto createEmployee(EmployeeRequest request);
    EmployeeDto updateEmployee(Long id, EmployeeRequest request);
    void deleteEmployee(Long id);
}
