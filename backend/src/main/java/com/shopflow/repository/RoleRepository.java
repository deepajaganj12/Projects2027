package com.shopflow.repository;
import com.shopflow.entity.ERole;
import com.shopflow.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(ERole name);
}
