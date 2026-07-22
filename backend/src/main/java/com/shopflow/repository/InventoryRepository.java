package com.shopflow.repository;
import com.shopflow.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByProductIdOrderByLastUpdatedDesc(Long productId);
}
