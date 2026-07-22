package com.ricebilling.repository;

import com.ricebilling.entity.Role;
import com.ricebilling.entity.Role.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
