import { Injectable, signal, inject, OnDestroy, computed } from '@angular/core';
import { WebSocketService, DataChangeNotification } from './websocket.service';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoreService implements OnDestroy {

  private state = signal<Record<string, any>>({});
  private webSocketService = inject(WebSocketService);
  private notificationSubscription?: Subscription;

  constructor() {
    // Start WebSocket connection
    this.webSocketService.connect();
    
    // Subscribe to WebSocket notifications
    this.notificationSubscription = this.webSocketService.notifications$.subscribe(
      (notification: DataChangeNotification) => {
        this.handleDataChange(notification);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  set(resource: string, data: any) {
    this.state.update(s => ({ ...s, [resource]: data }));
  }

  select(resource: string) {
    return computed(() => this.state()[resource] || []);
  }

  private handleDataChange(notification: DataChangeNotification): void {
    const { changeType, dataTypeId, data } = notification;
    const currentData = this.state()[dataTypeId] || [];

    switch (changeType) {
      case 'CREATE':
        // Add data if it doesn't already exist
        if (Array.isArray(currentData)) {
          const exists = currentData.some((item: any) => item.id === (data as any).id);
          if (!exists) {
            this.state.update(s => ({
              ...s,
              [dataTypeId]: [...currentData, data]
            }));
            console.log(`Data added to ${dataTypeId}:`, data);
          } else {
            console.log(`Data already exists in ${dataTypeId}, skipping:`, data);
          }
        } else {
          // If currentData is not an array, initialize it
          this.state.update(s => ({
            ...s,
            [dataTypeId]: [data]
          }));
          console.log(`Data added to ${dataTypeId}:`, data);
        }
        break;

      case 'UPDATE':
        // Update data
        if (Array.isArray(currentData)) {
          const updatedData = currentData.map((item: any) => 
            item.id === data.id ? data : item
          );
          this.state.update(s => ({
            ...s,
            [dataTypeId]: updatedData
          }));
          console.log(`Data updated in ${dataTypeId}:`, data);
        }
        break;

      case 'DELETE':
        // Delete data
        if (Array.isArray(currentData)) {
          const filteredData = currentData.filter((item: any) => item.id !== data.id);
          this.state.update(s => ({
            ...s,
            [dataTypeId]: filteredData
          }));
          console.log(`Data deleted from ${dataTypeId}:`, data);
        }
        break;
    }
  }

}
