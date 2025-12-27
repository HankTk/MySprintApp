import {Injectable, inject, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Inventory, CreateInventoryRequest} from '../models/inventory.model';
import {ResourceService} from '../../../shared/services/resource.service';
import {TranslateService} from '@ngx-translate/core';
import {InventoryDialogComponent, InventoryDialogData} from '../components/inventory-dialog/inventory-dialog.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData
} from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class InventoryService
{
  private apiUrl = 'http://localhost:8080/api/inventory';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getInventory(): Observable<Inventory[]>
  {
    return this.http.get<Inventory[]>(this.apiUrl);
  }

  getInventoryById(id: string): Observable<Inventory>
  {
    return this.http.get<Inventory>(`${this.apiUrl}/${id}`);
  }

  getInventoryByProductAndWarehouse(productId: string, warehouseId: string): Observable<Inventory>
  {
    return this.http.get<Inventory>(`${this.apiUrl}/product/${productId}/warehouse/${warehouseId}`);
  }

  createInventory(inventory: CreateInventoryRequest): Observable<Inventory>
  {
    return this.http.post<Inventory>(this.apiUrl, inventory);
  }

  updateInventory(id: string, inventory: Inventory): Observable<Inventory>
  {
    return this.http.put<Inventory>(`${this.apiUrl}/${id}`, inventory);
  }

  deleteInventory(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadInventory(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
        'inventory',
        isLoading,
        this.translate.instant('messages.failedToLoad', {resource: 'inventory'})
    );
  }

  createInventoryWithNotification(
      inventoryData: CreateInventoryRequest,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.createResource(
        'inventory',
        inventoryData,
        isLoading,
        this.translate.instant('messages.inventoryCreatedSuccessfully'),
        this.translate.instant('messages.failedToCreateInventory')
    );
  }

  updateInventoryWithNotification(
      inventoryData: Inventory,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.updateResource(
        'inventory',
        inventoryData.id!,
        inventoryData,
        isLoading,
        this.translate.instant('messages.inventoryUpdatedSuccessfully'),
        this.translate.instant('messages.failedToUpdateInventory')
    );
  }

  deleteInventoryWithNotification(
      id: string,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.deleteResource(
        'inventory',
        id,
        isLoading,
        this.translate.instant('messages.inventoryDeletedSuccessfully'),
        this.translate.instant('messages.failedToDeleteInventory')
    );
  }

  openAddInventoryDialog(isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(InventoryDialogComponent,
        {
          data: {isEdit: false} as InventoryDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'create')
      {
        this.createInventoryWithNotification(result.inventory, isLoading);
      }
    });
  }

  openEditInventoryDialog(inventory: Inventory, isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(InventoryDialogComponent,
        {
          data: {inventory, isEdit: true} as InventoryDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'update')
      {
        this.updateInventoryWithNotification(result.inventory, isLoading);
      }
    });
  }

  openDeleteInventoryDialog(inventory: Inventory, isLoading: WritableSignal<boolean>): void
  {
    const inventoryLabel = `Product: ${inventory.productId}, Warehouse: ${inventory.warehouseId}`;
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
        {
          data: {
            userName: inventoryLabel,
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
        this.deleteInventoryWithNotification(inventory.id!, isLoading);
      }
    });
  }
}

