package com.edge.service;

/**
 * @author Hidenori Takaku
 */
import com.edge.config.DataChangeNotification;
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
    
    @Autowired
    private WebSocketNotificationService notificationService;
    
    private static final String DATA_TYPE_ID = "products";
    
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
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.CREATE, DATA_TYPE_ID, created);
        return created;
    }
    
    public Product updateProduct(String id, Product productDetails) {
        Product updated = productRepository.updateProduct(id, productDetails);
        notificationService.notifyDataChange(DataChangeNotification.ChangeType.UPDATE, DATA_TYPE_ID, updated);
        return updated;
    }
    
    public void deleteProduct(String id) {
        Optional<Product> productToDelete = productRepository.getProductById(id);
        productRepository.deleteProduct(id);
        if (productToDelete.isPresent()) {
            notificationService.notifyDataChange(DataChangeNotification.ChangeType.DELETE, DATA_TYPE_ID, productToDelete.get());
        }
    }
}

