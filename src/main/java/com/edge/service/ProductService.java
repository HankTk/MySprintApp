package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Product;
import com.edge.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired(required = false)
    private WebSocketService webSocketService;
    
    public List<Product> getAllProducts() {
        return productRepository.getAllProducts();
    }
    
    public List<Product> getActiveProducts() {
        return productRepository.getActiveProducts();
    }
    
    public Optional<Product> getProductById(String id) {
        return productRepository.getProductById(id);
    }
    
    public Optional<Product> getProductByProductCode(String productCode) {
        return productRepository.getProductByProductCode(productCode);
    }
    
    public Product createProduct(Product product) {
        Product created = productRepository.createProduct(product);
        if (webSocketService != null) {
            webSocketService.broadcastProductUpdate(created);
        }
        return created;
    }
    
    public Product updateProduct(String id, Product productDetails) {
        Product updated = productRepository.updateProduct(id, productDetails);
        if (webSocketService != null) {
            webSocketService.broadcastProductUpdate(updated);
        }
        return updated;
    }
    
    public void deleteProduct(String id) {
        productRepository.deleteProduct(id);
        if (webSocketService != null) {
            webSocketService.broadcastProductDelete(id);
        }
    }
}

