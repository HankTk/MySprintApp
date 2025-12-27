package com.edge.service;

import com.edge.config.DataChangeNotification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService
{
    
    private final SimpMessagingTemplate messagingTemplate;
    
    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate)
    {
        this.messagingTemplate = messagingTemplate;
    }
    
    public void notifyDataChange(DataChangeNotification.ChangeType changeType, String dataTypeId, Object data)
    {
        DataChangeNotification notification = new DataChangeNotification(changeType, dataTypeId, data);
        messagingTemplate.convertAndSend("/topic/data-changes", notification);
    }
}
