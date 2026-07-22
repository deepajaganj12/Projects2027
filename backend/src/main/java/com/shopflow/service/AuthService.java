package com.shopflow.service;
import com.shopflow.dto.*;
public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserDto register(RegisterRequest request);
    UserDto getProfile(String username);
}
