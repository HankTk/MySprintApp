package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Order;
import com.edge.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Component
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Order> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/customer/{customerId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<Order> getOrdersByCustomerId(@PathVariable String customerId) {
        return orderService.getOrdersByCustomerId(customerId);
    }

    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<Order> getOrdersByStatus(@PathVariable String status) {
        return orderService.getOrdersByStatus(status);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Order> updateOrder(@PathVariable String id, @RequestBody Order orderDetails) {
        try {
            System.out.println("Received update request for order ID: " + id);
            System.out.println("Order details status: " + orderDetails.getStatus());
            Order updatedOrder = orderService.updateOrder(id, orderDetails);
            System.out.println("Updated order status: " + updatedOrder.getStatus());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            System.err.println("Error updating order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/{orderId}/items", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Order> addOrderItem(
            @PathVariable String orderId,
            @RequestBody AddOrderItemRequest request) {
        try {
            Order updatedOrder = orderService.addOrderItem(orderId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{orderId}/items/{itemId}/quantity", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<Order> updateOrderItemQuantity(
            @PathVariable String orderId,
            @PathVariable String itemId,
            @RequestBody UpdateQuantityRequest request) {
        try {
            Order updatedOrder = orderService.updateOrderItemQuantity(orderId, itemId, request.getQuantity());
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping(value = "/{orderId}/items/{itemId}")
    public ResponseEntity<Order> removeOrderItem(
            @PathVariable String orderId,
            @PathVariable String itemId) {
        try {
            Order updatedOrder = orderService.removeOrderItem(orderId, itemId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(value = "/invoice/next-number", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<InvoiceNumberResponse> getNextInvoiceNumber() {
        try {
            String invoiceNumber = orderService.generateNextInvoiceNumber();
            return ResponseEntity.ok(new InvoiceNumberResponse(invoiceNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    public static class InvoiceNumberResponse {
        private String invoiceNumber;
        
        public InvoiceNumberResponse(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }
        
        public String getInvoiceNumber() {
            return invoiceNumber;
        }
        
        public void setInvoiceNumber(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }
    }

    // Request DTOs
    public static class AddOrderItemRequest {
        private String productId;
        private Integer quantity;

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class UpdateQuantityRequest {
        private Integer quantity;

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}

