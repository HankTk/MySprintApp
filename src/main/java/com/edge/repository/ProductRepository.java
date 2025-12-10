package com.edge.repository;

/**
 * @author Hidenori Takaku
 */
import com.edge.entity.Product;
import com.fasterxml.jackson.core.type.TypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class ProductRepository extends AbstractJsonRepository<Product> {
    private static final Logger logger = LoggerFactory.getLogger(ProductRepository.class);
    private static final String DATA_FILE_NAME = "products.json";
    private static final String DATA_DIR_NAME = "data";

    public ProductRepository() {
        super(DATA_DIR_NAME, DATA_FILE_NAME, "products");
    }

    @Override
    protected void loadItemsFromFile() throws IOException {
        String content = new String(java.nio.file.Files.readAllBytes(dataFilePath));
        if (content.trim().isEmpty()) {
            logger.info("Data file is empty, starting with empty product list");
            items = new java.util.ArrayList<>();
            return;
        }
        try {
            items = objectMapper.readValue(dataFilePath.toFile(), new TypeReference<List<Product>>() {});
            logger.info("Successfully loaded {} products from data file", items.size());
        } catch (Exception e) {
            logger.error("Error parsing JSON data: {}", e.getMessage(), e);
            items = new java.util.ArrayList<>();
        }
    }

    @Override
    protected String getId(Product entity) {
        return entity.getId();
    }

    @Override
    protected void setId(Product entity, String id) {
        entity.setId(id);
    }

    public Optional<Product> getProductById(String id) {
        return findById(id);
    }

    public Optional<Product> getProductByProductCode(String productCode) {
        if (productCode == null || productCode.trim().isEmpty()) return Optional.empty();
        return items.stream().filter(product -> productCode.equals(product.getProductCode())).findFirst();
    }

    public List<Product> getAllProducts() {
        return findAll();
    }

    public List<Product> getActiveProducts() {
        return items.stream()
            .filter(product -> product.isActive())
            .collect(java.util.stream.Collectors.toList());
    }

    public Product createProduct(Product product) {
        if (product == null) throw new IllegalArgumentException("Product cannot be null");
        if (product.getProductCode() != null && !product.getProductCode().trim().isEmpty() && 
            getProductByProductCode(product.getProductCode()).isPresent()) {
            throw new ProductAlreadyExistsException("Product with code " + product.getProductCode() + " already exists");
        }
        return save(product);
    }

    public Product updateProduct(String id, Product productDetails) {
        if (id == null || id.trim().isEmpty())
            throw new IllegalArgumentException("Product ID cannot be null or empty");
        if (productDetails == null)
            throw new IllegalArgumentException("Product details cannot be null");

        Product existingProduct = findById(id).orElseThrow(() -> 
            new ProductNotFoundException("Product not found with id: " + id));

        if (productDetails.getProductCode() != null && !productDetails.getProductCode().trim().isEmpty()) {
            Optional<Product> codeCheck = getProductByProductCode(productDetails.getProductCode());
            if (codeCheck.isPresent() && !id.equals(codeCheck.get().getId())) {
                throw new ProductAlreadyExistsException("Product with code " + productDetails.getProductCode() + " already exists");
            }
        }

        // Update fields
        existingProduct.setProductCode(productDetails.getProductCode());
        existingProduct.setProductName(productDetails.getProductName());
        existingProduct.setDescription(productDetails.getDescription());
        existingProduct.setUnitPrice(productDetails.getUnitPrice());
        existingProduct.setCost(productDetails.getCost());
        existingProduct.setUnitOfMeasure(productDetails.getUnitOfMeasure());
        existingProduct.setActive(productDetails.isActive());
        existingProduct.setJsonData(productDetails.getJsonData());
        
        saveItems();
        logger.info("Updated product with ID: {}", id);
        return existingProduct;
    }

    public void deleteProduct(String id) {
        deleteById(id);
    }

    public static class ProductNotFoundException extends EntityNotFoundException {
        public ProductNotFoundException(String message) { super(message); }
    }

    public static class ProductAlreadyExistsException extends EntityAlreadyExistsException {
        public ProductAlreadyExistsException(String message) { super(message); }
    }
}

