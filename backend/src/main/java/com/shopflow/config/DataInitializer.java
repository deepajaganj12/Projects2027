package com.shopflow.config;

import com.shopflow.entity.*;
import com.shopflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initRoles();
        initUsers();
        initCategories();
        initProducts();
        initCustomers();
        initEmployees();
    }

    private void initRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
            roleRepository.save(new Role(null, ERole.ROLE_MANAGER));
            roleRepository.save(new Role(null, ERole.ROLE_CASHIER));
        }
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
            Role managerRole = roleRepository.findByName(ERole.ROLE_MANAGER).orElseThrow();
            Role cashierRole = roleRepository.findByName(ERole.ROLE_CASHIER).orElseThrow();

            User admin = User.builder().name("Admin User").username("admin")
                .email("admin@shopflow.com").password(passwordEncoder.encode("admin123"))
                .active(true).roles(new HashSet<>(Arrays.asList(adminRole))).build();
            User manager = User.builder().name("Store Manager").username("manager")
                .email("manager@shopflow.com").password(passwordEncoder.encode("manager123"))
                .active(true).roles(new HashSet<>(Arrays.asList(managerRole))).build();
            User cashier = User.builder().name("John Cashier").username("cashier")
                .email("cashier@shopflow.com").password(passwordEncoder.encode("cashier123"))
                .active(true).roles(new HashSet<>(Arrays.asList(cashierRole))).build();
            userRepository.saveAll(Arrays.asList(admin, manager, cashier));
        }
    }

    private void initCategories() {
        if (categoryRepository.count() == 0) {
            categoryRepository.saveAll(Arrays.asList(
                Category.builder().name("Rice & Grains").description("All types of rice and grains").build(),
                Category.builder().name("Pulses & Lentils").description("Dal, beans and lentils").build(),
                Category.builder().name("Spices").description("Indian spices and masalas").build(),
                Category.builder().name("Oils & Ghee").description("Cooking oils and ghee").build(),
                Category.builder().name("Flour & Atta").description("Wheat flour and other flours").build()
            ));
        }
    }

    private void initProducts() {
        if (productRepository.count() == 0) {
            Category rice = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals("Rice & Grains"))
                .findFirst()
                .orElse(categoryRepository.findAll().get(0));

            productRepository.saveAll(Arrays.asList(
                Product.builder().name("Premium Basmati Rice").barcode("RC001").category(rice)
                    .purchasePrice(new BigDecimal("80.00")).sellingPrice(new BigDecimal("150.00"))
                    .stock(120).minimumStock(15).active(true).build(),
                Product.builder().name("Super Dubar Basmati Rice 5kg").barcode("RC002").category(rice)
                    .purchasePrice(new BigDecimal("450.00")).sellingPrice(new BigDecimal("650.00"))
                    .stock(80).minimumStock(15).active(true).build(),
                Product.builder().name("Rozana Basmati Rice 10kg").barcode("RC003").category(rice)
                    .purchasePrice(new BigDecimal("600.00")).sellingPrice(new BigDecimal("850.00"))
                    .stock(150).minimumStock(15).active(true).build(),
                Product.builder().name("Ponni Boiled Rice 5kg").barcode("RC004").category(rice)
                    .purchasePrice(new BigDecimal("220.00")).sellingPrice(new BigDecimal("320.00"))
                    .stock(200).minimumStock(15).active(true).build(),
                Product.builder().name("Ponni Raw Rice 5kg").barcode("RC005").category(rice)
                    .purchasePrice(new BigDecimal("240.00")).sellingPrice(new BigDecimal("340.00"))
                    .stock(180).minimumStock(15).active(true).build(),
                Product.builder().name("Tanjore Ponni Rice 10kg").barcode("RC006").category(rice)
                    .purchasePrice(new BigDecimal("420.00")).sellingPrice(new BigDecimal("620.00"))
                    .stock(110).minimumStock(15).active(true).build(),
                Product.builder().name("Sona Masuri Raw Rice 5kg").barcode("RC007").category(rice)
                    .purchasePrice(new BigDecimal("180.00")).sellingPrice(new BigDecimal("280.00"))
                    .stock(250).minimumStock(15).active(true).build(),
                Product.builder().name("Sona Masuri Steam Rice 10kg").barcode("RC008").category(rice)
                    .purchasePrice(new BigDecimal("380.00")).sellingPrice(new BigDecimal("540.00"))
                    .stock(300).minimumStock(15).active(true).build(),
                Product.builder().name("Brown Rice 1kg").barcode("RC009").category(rice)
                    .purchasePrice(new BigDecimal("70.00")).sellingPrice(new BigDecimal("110.00"))
                    .stock(90).minimumStock(15).active(true).build(),
                Product.builder().name("Premium Jasmine Rice 1kg").barcode("RC010").category(rice)
                    .purchasePrice(new BigDecimal("120.00")).sellingPrice(new BigDecimal("180.00"))
                    .stock(70).minimumStock(15).active(true).build(),
                Product.builder().name("Jasmine Rice Bag 5kg").barcode("RC011").category(rice)
                    .purchasePrice(new BigDecimal("550.00")).sellingPrice(new BigDecimal("800.00"))
                    .stock(60).minimumStock(15).active(true).build(),
                Product.builder().name("Kolam Rice 5kg").barcode("RC012").category(rice)
                    .purchasePrice(new BigDecimal("200.00")).sellingPrice(new BigDecimal("300.00"))
                    .stock(220).minimumStock(15).active(true).build(),
                Product.builder().name("Wada Kolam Rice 10kg").barcode("RC013").category(rice)
                    .purchasePrice(new BigDecimal("400.00")).sellingPrice(new BigDecimal("580.00"))
                    .stock(130).minimumStock(15).active(true).build(),
                Product.builder().name("Idli Rice Premium 5kg").barcode("RC014").category(rice)
                    .purchasePrice(new BigDecimal("160.00")).sellingPrice(new BigDecimal("250.00"))
                    .stock(170).minimumStock(15).active(true).build(),
                Product.builder().name("Red Rice Kerala 1kg").barcode("RC015").category(rice)
                    .purchasePrice(new BigDecimal("65.00")).sellingPrice(new BigDecimal("95.00"))
                    .stock(100).minimumStock(15).active(true).build(),
                Product.builder().name("Black Rice 500g").barcode("RC016").category(rice)
                    .purchasePrice(new BigDecimal("80.00")).sellingPrice(new BigDecimal("120.00"))
                    .stock(50).minimumStock(15).active(true).build(),
                Product.builder().name("Seeraga Samba Rice 1kg").barcode("RC017").category(rice)
                    .purchasePrice(new BigDecimal("110.00")).sellingPrice(new BigDecimal("160.00"))
                    .stock(140).minimumStock(15).active(true).build(),
                Product.builder().name("Seeraga Samba Bag 5kg").barcode("RC018").category(rice)
                    .purchasePrice(new BigDecimal("520.00")).sellingPrice(new BigDecimal("750.00"))
                    .stock(85).minimumStock(15).active(true).build(),
                Product.builder().name("Broken Rice 1kg").barcode("RC019").category(rice)
                    .purchasePrice(new BigDecimal("30.00")).sellingPrice(new BigDecimal("45.00"))
                    .stock(300).minimumStock(15).active(true).build(),
                Product.builder().name("Gobindobhog Rice 1kg").barcode("RC020").category(rice)
                    .purchasePrice(new BigDecimal("85.00")).sellingPrice(new BigDecimal("130.00"))
                    .stock(95).minimumStock(15).active(true).build()
            ));
        }
    }

    private void initCustomers() {
        if (customerRepository.count() == 0) {
            customerRepository.saveAll(Arrays.asList(
                Customer.builder().name("Ravi Kumar").email("ravi@gmail.com").phone("9876543210").address("Chennai, TN").points(150).build(),
                Customer.builder().name("Priya Sharma").email("priya@gmail.com").phone("9876543211").address("Mumbai, MH").points(200).build(),
                Customer.builder().name("Suresh Babu").email("suresh@gmail.com").phone("9876543212").address("Bangalore, KA").points(75).build()
            ));
        }
    }

    private void initEmployees() {
        if (employeeRepository.count() == 0) {
            employeeRepository.saveAll(Arrays.asList(
                Employee.builder().name("Ramesh Kumar").email("ramesh@shopflow.com").phone("9876500001")
                    .role("MANAGER").salary(new BigDecimal("35000")).status("ACTIVE").joiningDate(LocalDate.of(2023,1,15)).build(),
                Employee.builder().name("Kavitha Devi").email("kavitha@shopflow.com").phone("9876500002")
                    .role("CASHIER").salary(new BigDecimal("20000")).status("ACTIVE").joiningDate(LocalDate.of(2023,3,10)).build()
            ));
        }
    }
}
