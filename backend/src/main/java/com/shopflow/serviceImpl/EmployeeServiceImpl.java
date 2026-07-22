package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.Employee;
import com.shopflow.exception.ResourceNotFoundException;
import com.shopflow.repository.EmployeeRepository;
import com.shopflow.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    @Autowired private EmployeeRepository employeeRepository;

    @Override
    public PagedResponse<EmployeeDto> getAllEmployees(Pageable pageable) {
        Page<Employee> page = employeeRepository.findAll(pageable);
        List<EmployeeDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<EmployeeDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    @Override public EmployeeDto getEmployeeById(Long id) {
        return mapToDto(employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id)));
    }

    @Override public EmployeeDto createEmployee(EmployeeRequest request) {
        Employee e = Employee.builder().name(request.getName()).email(request.getEmail())
            .phone(request.getPhone()).role(request.getRole()).salary(request.getSalary())
            .status(request.getStatus()).joiningDate(request.getJoiningDate()).build();
        return mapToDto(employeeRepository.save(e));
    }

    @Override public EmployeeDto updateEmployee(Long id, EmployeeRequest request) {
        Employee e = employeeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
        e.setName(request.getName()); e.setEmail(request.getEmail());
        e.setPhone(request.getPhone()); e.setRole(request.getRole());
        e.setSalary(request.getSalary()); e.setStatus(request.getStatus());
        e.setJoiningDate(request.getJoiningDate());
        return mapToDto(employeeRepository.save(e));
    }

    @Override public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) throw new ResourceNotFoundException("Employee not found: " + id);
        employeeRepository.deleteById(id);
    }

    private EmployeeDto mapToDto(Employee e) {
        return EmployeeDto.builder().id(e.getId()).name(e.getName()).email(e.getEmail())
            .phone(e.getPhone()).role(e.getRole()).salary(e.getSalary()).status(e.getStatus())
            .joiningDate(e.getJoiningDate()).createdAt(e.getCreatedAt()).build();
    }
}
