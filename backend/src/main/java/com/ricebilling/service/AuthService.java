package com.ricebilling.service;

import com.ricebilling.dto.AuthRequest.*;
import com.ricebilling.entity.Role;
import com.ricebilling.entity.Role.ERole;
import com.ricebilling.entity.User;
import com.ricebilling.repository.RoleRepository;
import com.ricebilling.repository.UserRepository;
import com.ricebilling.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired AuthenticationManager authManager;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        SecurityContextHolder.getContext().setAuthentication(auth);
        String jwt = jwtUtils.generateJwtToken(auth);
        var principal = (org.springframework.security.core.userdetails.User) auth.getPrincipal();
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).collect(Collectors.toList());
        User user = userRepository.findByUsername(principal.getUsername()).orElseThrow();
        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roles);
    }

    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username()))
            throw new RuntimeException("Username is already taken!");
        if (userRepository.existsByEmail(request.email()))
            throw new RuntimeException("Email is already in use!");

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));

        ERole eRole = "admin".equalsIgnoreCase(request.role()) ? ERole.ROLE_ADMIN : ERole.ROLE_STAFF;
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        user.setRoles(Set.of(role));
        userRepository.save(user);
        return "User registered successfully!";
    }
}
