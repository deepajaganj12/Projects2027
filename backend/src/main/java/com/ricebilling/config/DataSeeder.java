package com.ricebilling.config;

import com.ricebilling.entity.Role;
import com.ricebilling.entity.Role.ERole;
import com.ricebilling.entity.User;
import com.ricebilling.entity.Product;
import com.ricebilling.repository.RoleRepository;
import com.ricebilling.repository.UserRepository;
import com.ricebilling.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired RoleRepository roleRepository;
    @Autowired UserRepository userRepository;
    @Autowired ProductRepository productRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed roles
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            roleRepository.save(new Role(ERole.ROLE_STAFF));
        }

        // Seed default admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@ricebilling.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
            System.out.println("✅ Default admin created: username=admin password=admin123");
        }

        // Seed default 20 products
        if (productRepository.count() == 0) {
            seedProduct("Premium Basmati Rice", "Aromatic long grain basmati rice, perfect for biryani.", "150.00", 120, "Basmati", "kg");
            seedProduct("Super Dubar Basmati Rice", "Premium quality aged Basmati rice.", "650.00", 80, "Basmati", "5kg bag");
            seedProduct("Rozana Basmati Rice", "Daily use long grain basmati rice.", "850.00", 150, "Basmati", "10kg bag");
            seedProduct("Ponni Boiled Rice", "Nutritious boiled Ponni rice.", "320.00", 200, "Ponni", "5kg bag");
            seedProduct("Ponni Raw Rice", "High quality raw Ponni rice.", "340.00", 180, "Ponni", "5kg bag");
            seedProduct("Tanjore Ponni Rice", "Authentic Tanjore boiled Ponni rice.", "620.00", 110, "Ponni", "10kg bag");
            seedProduct("Sona Masoori Raw Rice", "Lightweight aromatic raw rice.", "280.00", 250, "Sona Masoori", "5kg bag");
            seedProduct("Sona Masoori Steam Rice", "Steamed Sona Masoori rice for daily consumption.", "540.00", 300, "Sona Masoori", "10kg bag");
            seedProduct("Brown Rice", "High-fiber healthy whole grain brown rice.", "110.00", 90, "Health", "kg");
            seedProduct("Premium Jasmine Rice", "Fragrant Thai Jasmine rice.", "180.00", 70, "Jasmine", "kg");
            seedProduct("Jasmine Rice Bag", "Jasmine rice ideal for Asian dishes.", "800.00", 60, "Jasmine", "5kg bag");
            seedProduct("Kolam Rice", "Jeera Kolam rice for daily cooking.", "300.00", 220, "Kolam", "5kg bag");
            seedProduct("Wada Kolam Rice", "Traditional Wada Kolam rice with rich taste.", "580.00", 130, "Kolam", "10kg bag");
            seedProduct("Idli Rice Premium", "Short grain rice optimized for soft idlis.", "250.00", 170, "Specialty", "5kg bag");
            seedProduct("Red Rice Kerala", "Traditional Matta/Red rice from Kerala.", "95.00", 100, "Health", "kg");
            seedProduct("Black Rice", "Nutritious and organic black rice.", "120.00", 50, "Health", "500g packet");
            seedProduct("Seeraga Samba Rice", "Traditional biryani rice of Tamil Nadu.", "160.00", 140, "Specialty", "kg");
            seedProduct("Seeraga Samba Bag", "Premium Seeraga Samba rice bag.", "750.00", 85, "Specialty", "5kg bag");
            seedProduct("Broken Rice", "Broken rice grains ideal for kheer and porridge.", "45.00", 300, "General", "kg");
            seedProduct("Gobindobhog Rice", "Short-grained, aromatic sticky white rice.", "130.00", 95, "Specialty", "kg");
            System.out.println("✅ Seeded 20 default rice products");
        }
    }

    private void seedProduct(String name, String description, String price, int stock, String category, String unit) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(new BigDecimal(price));
        p.setStockQuantity(stock);
        p.setCategory(category);
        p.setUnit(unit);
        p.setLowStockThreshold(15);
        p.setActive(true);
        productRepository.save(p);
    }
}
