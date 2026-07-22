package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.*;
import com.shopflow.exception.BadRequestException;
import com.shopflow.repository.*;
import com.shopflow.security.*;
import com.shopflow.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
            .map(item -> item.getAuthority()).collect(Collectors.toList());
        return AuthResponse.builder().token(jwt).type("Bearer").id(userDetails.getId())
            .username(userDetails.getUsername()).email(userDetails.getEmail())
            .name(userDetails.getName()).roles(roles).build();
    }

    @Override
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new BadRequestException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new BadRequestException("Email already in use");
        User user = User.builder().name(request.getName()).username(request.getUsername())
            .email(request.getEmail()).password(passwordEncoder.encode(request.getPassword())).build();
        Set<Role> roles = new HashSet<>();
        if (request.getRoles() == null || request.getRoles().isEmpty()) {
            roles.add(roleRepository.findByName(ERole.ROLE_CASHIER).orElseThrow());
        } else {
            request.getRoles().forEach(role -> {
                switch (role) {
                    case "admin" -> roles.add(roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow());
                    case "manager" -> roles.add(roleRepository.findByName(ERole.ROLE_MANAGER).orElseThrow());
                    default -> roles.add(roleRepository.findByName(ERole.ROLE_CASHIER).orElseThrow());
                }
            });
        }
        user.setRoles(roles);
        User saved = userRepository.save(user);
        return mapToUserDto(saved);
    }

    @Override
    public UserDto getProfile(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return mapToUserDto(user);
    }

    private UserDto mapToUserDto(User user) {
        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name()).collect(Collectors.toList());
        return UserDto.builder().id(user.getId()).name(user.getName())
            .username(user.getUsername()).email(user.getEmail())
            .active(user.isActive()).roles(roles).createdAt(user.getCreatedAt()).build();
    }
}
