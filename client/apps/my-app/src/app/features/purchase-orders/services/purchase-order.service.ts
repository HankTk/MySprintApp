import {Injectable, inject, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {PurchaseOrder, CreatePurchaseOrderRequest} from '../models/purchase-order.model';
import {ResourceService} from '../../../shared/services/resource.service';
import {TranslateService} from '@ngx-translate/core';
import {PurchaseOrderDialogComponent, PurchaseOrderDialogData} from '../components/po-dialog/po-dialog.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData
} from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService
{
  private apiUrl = 'http://localhost:8080/api/purchase-orders';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  getPurchaseOrders(): Observable<PurchaseOrder[]>
  {
    return this.http.get<PurchaseOrder[]>(this.apiUrl);
  }

  getPurchaseOrder(id: string): Observable<PurchaseOrder>
  {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  createPurchaseOrder(po: CreatePurchaseOrderRequest): Observable<PurchaseOrder>
  {
    return this.http.post<PurchaseOrder>(this.apiUrl, po);
  }

  updatePurchaseOrder(id: string, po: PurchaseOrder): Observable<PurchaseOrder>
  {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${id}`, po);
  }

  deletePurchaseOrder(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadPurchaseOrders(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
        'purchase-orders',
        isLoading,
        this.translate.instant('messages.failedToLoad', {resource: 'purchase-orders'})
    );
  }

  createPurchaseOrderWithNotification(
      poData: CreatePurchaseOrderRequest,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.createResource(
        'purchase-orders',
        poData,
        isLoading,
        this.translate.instant('messages.purchaseOrderCreatedSuccessfully'),
        this.translate.instant('messages.failedToCreatePurchaseOrder')
    );
  }

  updatePurchaseOrderWithNotification(
      poData: PurchaseOrder,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.updateResource(
        'purchase-orders',
        poData.id!,
        poData,
        isLoading,
        this.translate.instant('messages.purchaseOrderUpdatedSuccessfully'),
        this.translate.instant('messages.failedToUpdatePurchaseOrder')
    );
  }

  deletePurchaseOrderWithNotification(
      id: string,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.deleteResource(
        'purchase-orders',
        id,
        isLoading,
        this.translate.instant('messages.purchaseOrderDeletedSuccessfully'),
        this.translate.instant('messages.failedToDeletePurchaseOrder')
    );
  }

  openAddPurchaseOrderDialog(isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(PurchaseOrderDialogComponent,
        {
          data: {isEdit: false} as PurchaseOrderDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'create')
      {
        this.createPurchaseOrderWithNotification(result.purchaseOrder, isLoading);
      }
    });
  }

  openEditPurchaseOrderDialog(po: PurchaseOrder, isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(PurchaseOrderDialogComponent,
        {
          data: {purchaseOrder: po, isEdit: true} as PurchaseOrderDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'update')
      {
        this.updatePurchaseOrderWithNotification(result.purchaseOrder, isLoading);
      }
    });
  }

  openDeletePurchaseOrderDialog(po: PurchaseOrder, isLoading: WritableSignal<boolean>): void
  {
    const poLabel = po.orderNumber || po.id || 'Purchase Order';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
        {
          data: {
            userName: poLabel,
            userEmail: ''
          } as DeleteConfirmDialogData,
          width: '500px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result === true)
      {
        this.deletePurchaseOrderWithNotification(po.id!, isLoading);
      }
    });
  }

  addPurchaseOrderItem(poId: string, productId: string, quantity: number): Observable<PurchaseOrder>
  {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/${poId}/items`, {
      productId,
      quantity
    });
  }

  updatePurchaseOrderItemQuantity(poId: string, itemId: string, quantity: number): Observable<PurchaseOrder>
  {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/${poId}/items/${itemId}/quantity`, {
      quantity
    });
  }

  removePurchaseOrderItem(poId: string, itemId: string): Observable<PurchaseOrder>
  {
    return this.http.delete<PurchaseOrder>(`${this.apiUrl}/${poId}/items/${itemId}`);
  }

  getNextInvoiceNumber(): Observable<{ invoiceNumber: string }>
  {
    return this.http.get<{ invoiceNumber: string }>(`${this.apiUrl}/invoice/next-number`);
  }

  openAddPurchaseOrderEntry(isLoading: WritableSignal<boolean>): void
  {
    // Navigate to purchase order entry page instead of opening dialog
    this.router.navigate(['/purchase-orders/new']);
  }

  openEditPurchaseOrderEntry(po: PurchaseOrder, isLoading: WritableSignal<boolean>): void
  {
    // Navigate to purchase order entry page instead of opening dialog
    if (po.id)
    {
      this.router.navigate(['/purchase-orders', po.id]);
    }
  }
}
