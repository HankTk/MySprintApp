package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.PurchaseOrder;
import com.edge.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Component
@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<PurchaseOrder> getAllPurchaseOrders() {
        return purchaseOrderService.getAllPurchaseOrders();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<PurchaseOrder> getPurchaseOrderById(@PathVariable String id) {
        return purchaseOrderService.getPurchaseOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/supplier/{supplierId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<PurchaseOrder> getPurchaseOrdersBySupplierId(@PathVariable String supplierId) {
        return purchaseOrderService.getPurchaseOrdersBySupplierId(supplierId);
    }

    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<PurchaseOrder> getPurchaseOrdersByStatus(@PathVariable String status) {
        return purchaseOrderService.getPurchaseOrdersByStatus(status);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public PurchaseOrder createPurchaseOrder(@RequestBody PurchaseOrder po) {
        return purchaseOrderService.createPurchaseOrder(po);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrder(@PathVariable String id, @RequestBody PurchaseOrder poDetails) {
        try {
            System.out.println("Received update request for purchase order ID: " + id);
            System.out.println("Purchase order details status: " + poDetails.getStatus());
            PurchaseOrder updatedPO = purchaseOrderService.updatePurchaseOrder(id, poDetails);
            System.out.println("Updated purchase order status: " + updatedPO.getStatus());
            return ResponseEntity.ok(updatedPO);
        } catch (RuntimeException e) {
            System.err.println("Error updating purchase order: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/{poId}/items", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<PurchaseOrder> addPurchaseOrderItem(
            @PathVariable String poId,
            @RequestBody AddPurchaseOrderItemRequest request) {
        try {
            PurchaseOrder updatedPO = purchaseOrderService.addPurchaseOrderItem(poId, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(updatedPO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{poId}/items/{itemId}/quantity", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<PurchaseOrder> updatePurchaseOrderItemQuantity(
            @PathVariable String poId,
            @PathVariable String itemId,
            @RequestBody UpdateQuantityRequest request) {
        try {
            PurchaseOrder updatedPO = purchaseOrderService.updatePurchaseOrderItemQuantity(poId, itemId, request.getQuantity());
            return ResponseEntity.ok(updatedPO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping(value = "/{poId}/items/{itemId}")
    public ResponseEntity<PurchaseOrder> removePurchaseOrderItem(
            @PathVariable String poId,
            @PathVariable String itemId) {
        try {
            PurchaseOrder updatedPO = purchaseOrderService.removePurchaseOrderItem(poId, itemId);
            return ResponseEntity.ok(updatedPO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable String id) {
        try {
            purchaseOrderService.deletePurchaseOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping(value = "/invoice/next-number", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<InvoiceNumberResponse> getNextInvoiceNumber() {
        try {
            String invoiceNumber = purchaseOrderService.generateNextInvoiceNumber();
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
    public static class AddPurchaseOrderItemRequest {
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

