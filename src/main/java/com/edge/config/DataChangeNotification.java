package com.edge.config;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DataChangeNotification
{
    
    public enum ChangeType
    {
        CREATE, UPDATE, DELETE
    }
    
    private ChangeType changeType;
    private String dataTypeId;  // Data type ID (e.g., "users", "products", etc.)
    private Object data;        // Changed data
    
    public DataChangeNotification()
    {
    }
    
    public DataChangeNotification(ChangeType changeType, String dataTypeId, Object data)
    {
        this.changeType = changeType;
        this.dataTypeId = dataTypeId;
        this.data = data;
    }
    
    public ChangeType getChangeType()
    {
        return changeType;
    }
    
    public void setChangeType(ChangeType changeType)
    {
        this.changeType = changeType;
    }
    
    public String getDataTypeId()
    {
        return dataTypeId;
    }
    
    public void setDataTypeId(String dataTypeId)
    {
        this.dataTypeId = dataTypeId;
    }
    
    public Object getData()
    {
        return data;
    }
    
    public void setData(Object data)
    {
        this.data = data;
    }
}
