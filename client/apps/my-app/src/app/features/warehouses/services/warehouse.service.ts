import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Warehouse, CreateWarehouseRequest } from '../models/warehouse.model';
import { ResourceService } from '../../../shared/services/resource.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseDialogComponent, WarehouseDialogData } from '../components/warehouse-dialog/warehouse-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = 'http://localhost:8080/api/warehouses';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.apiUrl);
  }

  getWarehouse(id: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/${id}`);
  }

  createWarehouse(warehouse: CreateWarehouseRequest): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, warehouse);
  }

  updateWarehouse(id: string, warehouse: Warehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/${id}`, warehouse);
  }

  deleteWarehouse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadWarehouses(isLoading: WritableSignal<boolean>): void {
    this.resourceManager.loadResource(
      'warehouses',
      isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'warehouses' })
    );
  }

  createWarehouseWithNotification(
    warehouseData: CreateWarehouseRequest,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.createResource(
      'warehouses',
      warehouseData,
      isLoading,
      this.translate.instant('messages.warehouseCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateWarehouse')
    );
  }

  updateWarehouseWithNotification(
    warehouseData: Warehouse,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.updateResource(
      'warehouses',
      warehouseData.id!,
      warehouseData,
      isLoading,
      this.translate.instant('messages.warehouseUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateWarehouse')
    );
  }

  deleteWarehouseWithNotification(
    id: string,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.deleteResource(
      'warehouses',
      id,
      isLoading,
      this.translate.instant('messages.warehouseDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteWarehouse')
    );
  }

  openAddWarehouseDialog(isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(WarehouseDialogComponent, {
      data: { isEdit: false } as WarehouseDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'create') {
        this.createWarehouseWithNotification(result.warehouse, isLoading);
      }
    });
  }

  openEditWarehouseDialog(warehouse: Warehouse, isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(WarehouseDialogComponent, {
      data: { warehouse, isEdit: true } as WarehouseDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'update') {
        this.updateWarehouseWithNotification(result.warehouse, isLoading);
      }
    });
  }

  openDeleteWarehouseDialog(warehouse: Warehouse, isLoading: WritableSignal<boolean>): void {
    const warehouseName = warehouse.warehouseName || warehouse.warehouseCode || warehouse.id || 'Warehouse';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {
        userName: warehouseName,
        userEmail: ''
      } as DeleteConfirmDialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteWarehouseWithNotification(warehouse.id!, isLoading);
      }
    });
  }
}

