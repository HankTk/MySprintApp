package com.edge.repository;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public abstract class AbstractJsonRepository<T>
{
    protected static final Logger logger = LoggerFactory.getLogger(AbstractJsonRepository.class);
    
    protected final ObjectMapper objectMapper;
    protected final Path dataFilePath;
    protected final String entityName;
    protected List<T> items = new ArrayList<>();

    public AbstractJsonRepository(String dataDirName, String fileName, String entityName)
    {
        this.objectMapper = createObjectMapper();
        this.dataFilePath = initializeDataFilePath(dataDirName, fileName);
        this.entityName = entityName;
        loadItems();
    }

    protected ObjectMapper createObjectMapper()
    {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    protected Path initializeDataFilePath(String dataDirName, String fileName)
    {
        Path currentDir = Paths.get("").toAbsolutePath();
        Path dataDir = currentDir.resolve(dataDirName);
        return dataDir.resolve(fileName);
    }

    protected void loadItems()
    {
        logger.info("Loading {} from data file: {}", entityName, dataFilePath);
        
        try
        {
            if (Files.exists(dataFilePath) && Files.isReadable(dataFilePath))
            {
                loadItemsFromFile();
            }
            else
            {
                logger.info("Data file does not exist or is not readable, starting with empty {} list", entityName);
                items = new ArrayList<>();
            }
        }
        catch (Exception e)
        {
            logger.error("Error loading {} from file: {}", entityName, e.getMessage(), e);
            items = new ArrayList<>();
        }
    }

    protected abstract void loadItemsFromFile() throws IOException;

    // Abstract methods for entity ID management
    protected abstract String getId(T entity);
    protected abstract void setId(T entity, String id);

    // Generic CRUD operations
    public Optional<T> findById(String id)
    {
        if (id == null || id.trim().isEmpty())
        {
            return Optional.empty();
        }
        
        return items.stream()
            .filter(entity -> id.equals(getId(entity)))
            .findFirst();
    }

    public T save(T entity)
    {
        if (entity == null)
        {
            throw new IllegalArgumentException(entityName + " cannot be null");
        }
        
        if (getId(entity) == null || getId(entity).isEmpty())
        {
            setId(entity, generateId());
            items.add(entity);
            saveItems();
            logger.info("Created new {} with ID: {}", entityName, getId(entity));
        }
        else
        {
            // Update existing
            findById(getId(entity))
                .orElseThrow(() -> new EntityNotFoundException(entityName + " not found with id: " + getId(entity)));
            
            // Replace in list
            items.removeIf(item -> getId(entity).equals(getId(item)));
            items.add(entity);
            saveItems();
            logger.info("Updated {} with ID: {}", entityName, getId(entity));
        }
        
        return entity;
    }

    public void deleteById(String id)
    {
        if (id == null || id.trim().isEmpty())
        {
            throw new IllegalArgumentException(entityName + " ID cannot be null or empty");
        }
        
        boolean removed = items.removeIf(entity -> id.equals(getId(entity)));
        if (removed)
        {
            saveItems();
            logger.info("Deleted {} with ID: {}", entityName, id);
        }
        else
        {
            logger.warn("Attempted to delete {} with ID: {}, but {} was not found", entityName, id, entityName);
        }
    }

    protected void saveItems()
    {
        logger.info("Saving {} {} to data file", items.size(), entityName);
        
        try
        {
            ensureDataDirectoryExists();
            objectMapper.writeValue(dataFilePath.toFile(), items);
            logger.info("Successfully saved {} {} to data file", items.size(), entityName);
        }
        catch (IOException e)
        {
            logger.error("Failed to save {}: {}", entityName, e.getMessage(), e);
            throw new DataPersistenceException("Failed to save " + entityName + " to file", e);
        }
        catch (Exception e)
        {
            logger.error("Unexpected error in saveItems: {}", e.getMessage(), e);
            throw new DataPersistenceException("Failed to save " + entityName + " to file", e);
        }
    }

    protected void ensureDataDirectoryExists()
    {
        Path dataDir = dataFilePath.getParent();
        if (!Files.exists(dataDir))
        {
            try
            {
                Files.createDirectories(dataDir);
                logger.info("Created data directory: {}", dataDir);
            }
            catch (IOException e)
            {
                logger.error("Failed to create data directory: {}", e.getMessage(), e);
                throw new DataPersistenceException("Failed to create data directory", e);
            }
        }
    }

    public List<T> findAll()
    {
        logger.debug("Getting all {}, returning {} items", entityName, items.size());
        return new ArrayList<>(items);
    }

    protected String generateId()
    {
        return UUID.randomUUID().toString();
    }

    public void saveAll()
    {
        saveItems();
    }

    // Custom exceptions
    public static class DataPersistenceException extends RuntimeException
    {
        public DataPersistenceException(String message, Throwable cause)
        {
            super(message, cause);
        }
    }

    public static class EntityNotFoundException extends RuntimeException
    {
        public EntityNotFoundException(String message)
        {
            super(message);
        }
    }

    public static class EntityAlreadyExistsException extends RuntimeException
    {
        public EntityAlreadyExistsException(String message)
        {
            super(message);
        }
    }

}

