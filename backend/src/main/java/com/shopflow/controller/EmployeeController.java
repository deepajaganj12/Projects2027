package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    @Autowired private EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<EmployeeDto>>> getAll(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
            employeeService.getAllEmployees(PageRequest.of(page, size)), "Success"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getEmployeeById(id), "Success"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeDto>> create(@Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.createEmployee(request), "Employee created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.updateEmployee(id, request), "Employee updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee deleted"));
    }
}
