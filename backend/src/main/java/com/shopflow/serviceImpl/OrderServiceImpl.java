package com.shopflow.serviceImpl;

import com.shopflow.dto.*;
import com.shopflow.entity.*;
import com.shopflow.exception.*;
import com.shopflow.repository.*;
import com.shopflow.service.OrderService;
import com.shopflow.service.BankAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private BankAccountService bankAccountService;

    @Override
    @Transactional
    public OrderDto createOrder(OrderRequest request, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Order order = new Order();
        order.setOrderNumber("ORD-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now()));
        order.setUser(user);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        order.setStatus("COMPLETED");
        if (request.getCustomerId() != null) {
            customerRepository.findById(request.getCustomerId()).ifPresent(order::setCustomer);
        }
        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));
            if (product.getStock() < itemReq.getQuantity())
                throw new BadRequestException("Insufficient stock for: " + product.getName());
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);
            BigDecimal itemSubtotal = itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            OrderItem item = OrderItem.builder().order(order).product(product)
                .quantity(itemReq.getQuantity()).price(itemReq.getPrice()).subtotal(itemSubtotal).build();
            items.add(item);
            subtotal = subtotal.add(itemSubtotal);
        }
        order.setSubtotal(subtotal);
        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(taxRate).divide(BigDecimal.valueOf(100));
        order.setTax(tax);
        BigDecimal discount = order.getDiscount();
        order.setGrandTotal(subtotal.add(tax).subtract(discount));
        order.setOrderItems(items);
        Order savedOrder = orderRepository.save(order);
        Payment payment = Payment.builder().order(savedOrder).amount(savedOrder.getGrandTotal())
            .paymentMethod(request.getPaymentMethod()).status("SUCCESS")
            .transactionId("TXN-" + System.currentTimeMillis()).build();
        paymentRepository.save(payment);
        
        try {
            bankAccountService.recordOrderPayment(savedOrder);
        } catch (Exception e) {
            // Log or ignore to prevent breaking the order transaction
        }

        return mapToDto(savedOrder);
    }

    @Override
    public OrderDto getOrderById(Long id) {
        return mapToDto(orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)));
    }

    @Override
    public PagedResponse<OrderDto> getAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAllByOrderByCreatedAtDesc(pageable);
        List<OrderDto> content = page.getContent().stream().map(this::mapToDto).collect(Collectors.toList());
        return PagedResponse.<OrderDto>builder().content(content).page(page.getNumber())
            .size(page.getSize()).totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages()).last(page.isLast()).build();
    }

    @Override
    public OrderDto cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        order.setStatus("CANCELLED");
        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product p = item.getProduct();
            p.setStock(p.getStock() + item.getQuantity());
            productRepository.save(p);
        }
        return mapToDto(orderRepository.save(order));
    }

    private OrderDto mapToDto(Order order) {
        List<OrderItemDto> items = order.getOrderItems().stream().map(i ->
            OrderItemDto.builder().id(i.getId()).productId(i.getProduct().getId())
                .productName(i.getProduct().getName()).quantity(i.getQuantity())
                .price(i.getPrice()).subtotal(i.getSubtotal()).build()
        ).collect(Collectors.toList());
        return OrderDto.builder().id(order.getId()).orderNumber(order.getOrderNumber())
            .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
            .customerName(order.getCustomer() != null ? order.getCustomer().getName() : "Walk-in Customer")
            .userId(order.getUser().getId()).userName(order.getUser().getName())
            .subtotal(order.getSubtotal()).discount(order.getDiscount())
            .tax(order.getTax()).grandTotal(order.getGrandTotal())
            .paymentMethod(order.getPaymentMethod()).status(order.getStatus())
            .orderItems(items).createdAt(order.getCreatedAt()).build();
    }

    @Override
    public ConsolidatedBillDto getConsolidatedBillForDate(java.time.LocalDate date) {
        if (date == null) {
            date = java.time.LocalDate.now();
        }
        java.time.LocalDateTime todayStart = date.atStartOfDay();
        java.time.LocalDateTime todayEnd = todayStart.plusDays(1);
        
        List<Order> orders = orderRepository.findByCreatedAtBetween(todayStart, todayEnd);
        
        List<Order> completedOrders = orders.stream()
            .filter(o -> "COMPLETED".equals(o.getStatus()))
            .collect(Collectors.toList());
            
        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalGrand = BigDecimal.ZERO;
        List<String> orderNumbers = new ArrayList<>();
        Map<String, BigDecimal> paymentBreakdown = new HashMap<>();
        
        Map<String, ConsolidatedItemDto> consolidatedItemsMap = new HashMap<>();
        
        for (Order order : completedOrders) {
            totalSubtotal = totalSubtotal.add(order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO);
            totalDiscount = totalDiscount.add(order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO);
            totalTax = totalTax.add(order.getTax() != null ? order.getTax() : BigDecimal.ZERO);
            totalGrand = totalGrand.add(order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO);
            orderNumbers.add(order.getOrderNumber());
            
            String method = order.getPaymentMethod();
            if (method == null || method.trim().isEmpty()) {
                method = "UNKNOWN";
            }
            BigDecimal currentPayment = paymentBreakdown.getOrDefault(method, BigDecimal.ZERO);
            paymentBreakdown.put(method, currentPayment.add(order.getGrandTotal() != null ? order.getGrandTotal() : BigDecimal.ZERO));
            
            for (OrderItem item : order.getOrderItems()) {
                Long productId = item.getProduct().getId();
                BigDecimal price = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
                String key = productId + "_" + price;
                
                ConsolidatedItemDto existing = consolidatedItemsMap.get(key);
                if (existing == null) {
                    consolidatedItemsMap.put(key, ConsolidatedItemDto.builder()
                        .productId(productId)
                        .productName(item.getProduct().getName())
                        .totalQuantity(item.getQuantity())
                        .price(price)
                        .subtotal(item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO)
                        .build());
                } else {
                    existing.setTotalQuantity(existing.getTotalQuantity() + item.getQuantity());
                    existing.setSubtotal(existing.getSubtotal().add(item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO));
                }
            }
        }
        
        List<ConsolidatedItemDto> itemList = new ArrayList<>(consolidatedItemsMap.values());
        
        return ConsolidatedBillDto.builder()
            .totalOrders((long) completedOrders.size())
            .orderNumbers(orderNumbers)
            .items(itemList)
            .subtotal(totalSubtotal)
            .discount(totalDiscount)
            .tax(totalTax)
            .grandTotal(totalGrand)
            .paymentMethodBreakdown(paymentBreakdown)
            .date(date)
            .build();
    }
}
