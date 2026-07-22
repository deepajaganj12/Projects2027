package com.shopflow.controller;

import com.shopflow.dto.*;
import com.shopflow.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @Autowired private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardData(), "Success"));
    }
}
