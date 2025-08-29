package com.edge.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "jsondb")
public class JsonDbConfig
{
    
    private String filePath = "./data/users.json";
    private boolean autoSave = true;
    
    public String getFilePath()
    {
        return filePath;
    }
    
    public void setFilePath(String filePath)
    {
        this.filePath = filePath;
    }
    
    public boolean isAutoSave()
    {
        return autoSave;
    }
    
    public void setAutoSave(boolean autoSave)
    {
        this.autoSave = autoSave;
    }
}
