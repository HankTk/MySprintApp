import {Injectable, OnDestroy} from '@angular/core';
import {Subject, BehaviorSubject} from 'rxjs';
import {Client, IMessage, IFrame} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface DataChangeNotification
{
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  dataTypeId: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy
{
  private stompClient: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isConnecting = false;
  private notificationSubject = new Subject<DataChangeNotification>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  public readonly notifications$ = this.notificationSubject.asObservable();
  public readonly connectionStatus$ = this.connectionStatusSubject.asObservable();

  private wsUrl = 'http://localhost:8080/ws';

  connect(): void
  {
    if (this.isConnecting || (this.stompClient && this.stompClient.connected))
    {
      return;
    }

    this.isConnecting = true;

    // Create STOMP client using SockJS
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () =>
      {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionStatusSubject.next(true);
        this.subscribeToDataChanges();
      },
      onStompError: (frame: IFrame) =>
      {
        console.error('STOMP error:', frame);
        this.isConnecting = false;
        this.connectionStatusSubject.next(false);
      },
      onWebSocketClose: () =>
      {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.connectionStatusSubject.next(false);
        this.attemptReconnect();
      },
      onDisconnect: () =>
      {
        console.log('STOMP disconnected');
        this.connectionStatusSubject.next(false);
      }
    });

    this.stompClient.activate();
  }

  private subscribeToDataChanges(): void
  {
    if (!this.stompClient || !this.stompClient.connected)
    {
      return;
    }

    this.stompClient.subscribe('/topic/data-changes', (message: IMessage) =>
    {
      try
      {
        const notification: DataChangeNotification = JSON.parse(message.body);
        this.notificationSubject.next(notification);
      }
      catch (error)
      {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  }

  private attemptReconnect(): void
  {
    if (this.reconnectAttempts < this.maxReconnectAttempts)
    {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() =>
      {
        this.connect();
      }, this.reconnectDelay);
    }
    else
    {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void
  {
    if (this.stompClient)
    {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.connectionStatusSubject.next(false);
  }

  isConnected(): boolean
  {
    return this.stompClient !== null && this.stompClient.connected;
  }

  ngOnDestroy(): void
  {
    this.disconnect();
  }
}
