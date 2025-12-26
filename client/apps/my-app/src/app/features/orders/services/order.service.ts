import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Order, CreateOrderRequest } from '../models/order.model';
import { ResourceService } from '../../../shared/services/resource.service';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';
import { OrderDialogComponent, OrderDialogData } from '../components/order-dialog/order-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class OrderService
{
  private apiUrl = 'http://localhost:8080/api/orders';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  getOrders(): Observable<Order[]>
  {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrder(id: string): Observable<Order>
  {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: CreateOrderRequest): Observable<Order>
  {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrder(id: string, order: Order): Observable<Order>
  {
    return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addOrderItem(orderId: string, productId: string, quantity: number): Observable<Order>
  {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/items`, { productId, quantity });
  }

  updateOrderItemQuantity(orderId: string, itemId: string, quantity: number): Observable<Order>
  {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/items/${itemId}/quantity`, { quantity });
  }

  removeOrderItem(orderId: string, itemId: string): Observable<Order>
  {
    return this.http.delete<Order>(`${this.apiUrl}/${orderId}/items/${itemId}`);
  }

  getNextInvoiceNumber(): Observable<{ invoiceNumber: string }>
  {
    return this.http.get<{ invoiceNumber: string }>(`${this.apiUrl}/invoice/next-number`);
  }

  loadOrders(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
      'orders',
      isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'orders' })
    );
  }

  createOrderWithNotification(
    orderData: CreateOrderRequest,
    isLoading: WritableSignal<boolean>
  ): void 
{
    this.resourceManager.createResource(
      'orders',
      orderData,
      isLoading,
      this.translate.instant('messages.orderCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateOrder')
    );
  }

  updateOrderWithNotification(
    orderData: Order,
    isLoading: WritableSignal<boolean>
  ): void 
{
    this.resourceManager.updateResource(
      'orders',
      orderData.id!,
      orderData,
      isLoading,
      this.translate.instant('messages.orderUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateOrder')
    );
  }

  deleteOrderWithNotification(
    id: string,
    isLoading: WritableSignal<boolean>
  ): void 
{
    this.resourceManager.deleteResource(
      'orders',
      id,
      isLoading,
      this.translate.instant('messages.orderDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteOrder')
    );
  }

  openAddOrderDialog(isLoading: WritableSignal<boolean>): void
  {
    // Navigate to order entry page instead of opening dialog
    this.router.navigate(['/orders/new']);
  }

  openEditOrderDialog(order: Order, isLoading: WritableSignal<boolean>): void
  {
    // Navigate to order entry page instead of opening dialog
    if (order.id)
    {
      this.router.navigate(['/orders', order.id]);
    }
  }

  openDeleteOrderDialog(order: Order, isLoading: WritableSignal<boolean>): void
  {
    const orderName = order.orderNumber || order.id || 'Order';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
    {
      data: {
        title: this.translate.instant('deleteDialog.confirmOrderDeletion'),
        message: this.translate.instant('deleteDialog.deleteOrderMessage'),
        itemName: orderName
      } as DeleteConfirmDialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => 
{
      if (result === true)
      {
        this.deleteOrderWithNotification(order.id!, isLoading);
      }
    });
  }

  getStatusColor(status?: string): string
  {
    switch (status)
    {
      case 'DRAFT':
        return '#6B7280';
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return '#F59E0B';
      case 'APPROVED':
        return '#3B82F6';
      case 'SHIPPING_INSTRUCTED':
        return '#10B981';
      case 'SHIPPED':
        return '#059669';
      case 'INVOICED':
        return '#8B5CF6';
      case 'PAID':
        return '#047857';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  getStatusBackgroundColor(status?: string): string
  {
    switch (status)
    {
      case 'DRAFT':
        return '#F3F4F6';
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return '#FEF3C7';
      case 'APPROVED':
        return '#DBEAFE';
      case 'SHIPPING_INSTRUCTED':
      case 'SHIPPED':
        return '#D1FAE5';
      case 'INVOICED':
        return '#EDE9FE';
      case 'PAID':
        return '#D1FAE5';
      case 'CANCELLED':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  }
}

