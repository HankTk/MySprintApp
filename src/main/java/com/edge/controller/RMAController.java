package com.edge.controller;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.RMA;
import com.edge.service.RMAService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Component
@RestController
@RequestMapping("/api/rmas")
public class RMAController {

    @Autowired
    private RMAService rmaService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<RMA> getAllRMAs() {
        return rmaService.getAllRMAs();
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<RMA> getRMAById(@PathVariable String id) {
        return rmaService.getRMAById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/order/{orderId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<RMA> getRMAsByOrderId(@PathVariable String orderId) {
        return rmaService.getRMAsByOrderId(orderId);
    }

    @GetMapping(value = "/customer/{customerId}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<RMA> getRMAsByCustomerId(@PathVariable String customerId) {
        return rmaService.getRMAsByCustomerId(customerId);
    }

    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public List<RMA> getRMAsByStatus(@PathVariable String status) {
        return rmaService.getRMAsByStatus(status);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public RMA createRMA(@RequestBody RMA rma) {
        return rmaService.createRMA(rma);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<RMA> updateRMA(@PathVariable String id, @RequestBody RMA rmaDetails) {
        try {
            System.out.println("Received update request for RMA ID: " + id);
            System.out.println("RMA details status: " + rmaDetails.getStatus());
            RMA updatedRMA = rmaService.updateRMA(id, rmaDetails);
            System.out.println("Updated RMA status: " + updatedRMA.getStatus());
            return ResponseEntity.ok(updatedRMA);
        } catch (RuntimeException e) {
            System.err.println("Error updating RMA: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping(value = "/{rmaId}/items", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<RMA> addRMAItem(
            @PathVariable String rmaId,
            @RequestBody AddRMAItemRequest request) {
        try {
            RMA updatedRMA = rmaService.addRMAItem(rmaId, request.getProductId(), request.getQuantity(), request.getReason());
            return ResponseEntity.ok(updatedRMA);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{rmaId}/items/{itemId}/quantity", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<RMA> updateRMAItemQuantity(
            @PathVariable String rmaId,
            @PathVariable String itemId,
            @RequestBody UpdateQuantityRequest request) {
        try {
            RMA updatedRMA = rmaService.updateRMAItemQuantity(rmaId, itemId, request.getQuantity());
            return ResponseEntity.ok(updatedRMA);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{rmaId}/items/{itemId}/returned-quantity", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<RMA> updateRMAItemReturnedQuantity(
            @PathVariable String rmaId,
            @PathVariable String itemId,
            @RequestBody UpdateQuantityRequest request) {
        try {
            RMA updatedRMA = rmaService.updateRMAItemReturnedQuantity(rmaId, itemId, request.getQuantity());
            return ResponseEntity.ok(updatedRMA);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping(value = "/{rmaId}/items/{itemId}/condition", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8")
    public ResponseEntity<RMA> updateRMAItemCondition(
            @PathVariable String rmaId,
            @PathVariable String itemId,
            @RequestBody UpdateConditionRequest request) {
        try {
            RMA updatedRMA = rmaService.updateRMAItemCondition(rmaId, itemId, request.getCondition());
            return ResponseEntity.ok(updatedRMA);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping(value = "/{rmaId}/items/{itemId}")
    public ResponseEntity<RMA> removeRMAItem(
            @PathVariable String rmaId,
            @PathVariable String itemId) {
        try {
            RMA updatedRMA = rmaService.removeRMAItem(rmaId, itemId);
            return ResponseEntity.ok(updatedRMA);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRMA(@PathVariable String id) {
        try {
            rmaService.deleteRMA(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Request DTOs
    public static class AddRMAItemRequest {
        private String productId;
        private Integer quantity;
        private String reason;

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

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
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

    public static class UpdateConditionRequest {
        private String condition;

        public String getCondition() {
            return condition;
        }

        public void setCondition(String condition) {
            this.condition = condition;
        }
    }
}

