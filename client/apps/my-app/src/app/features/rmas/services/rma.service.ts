import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RMA, CreateRMARequest } from '../models/rma.model';
import { ResourceService } from '../../../shared/services/resource.service';
import { TranslateService } from '@ngx-translate/core';
import { RMADialogComponent, RMADialogData } from '../components/rma-dialog/rma-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class RMAService {
  private apiUrl = 'http://localhost:8080/api/rmas';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  getRMAs(): Observable<RMA[]> {
    return this.http.get<RMA[]>(this.apiUrl);
  }

  getRMA(id: string): Observable<RMA> {
    return this.http.get<RMA>(`${this.apiUrl}/${id}`);
  }

  createRMA(rma: CreateRMARequest): Observable<RMA> {
    return this.http.post<RMA>(this.apiUrl, rma);
  }

  updateRMA(id: string, rma: RMA): Observable<RMA> {
    return this.http.put<RMA>(`${this.apiUrl}/${id}`, rma);
  }

  deleteRMA(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadRMAs(isLoading: WritableSignal<boolean>): void {
    this.resourceManager.loadResource(
      'rmas',
      isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'rmas' })
    );
  }

  createRMAWithNotification(
    rmaData: CreateRMARequest,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.createResource(
      'rmas',
      rmaData,
      isLoading,
      this.translate.instant('messages.rmaCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateRMA')
    );
  }

  updateRMAWithNotification(
    rmaData: RMA,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.updateResource(
      'rmas',
      rmaData.id!,
      rmaData,
      isLoading,
      this.translate.instant('messages.rmaUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateRMA')
    );
  }

  deleteRMAWithNotification(
    id: string,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.deleteResource(
      'rmas',
      id,
      isLoading,
      this.translate.instant('messages.rmaDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteRMA')
    );
  }

  openAddRMADialog(isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(RMADialogComponent, {
      data: { isEdit: false } as RMADialogData,
      width: '800px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'create') {
        this.createRMAWithNotification(result.rma, isLoading);
      }
    });
  }

  openEditRMADialog(rma: RMA, isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(RMADialogComponent, {
      data: { rma, isEdit: true } as RMADialogData,
      width: '800px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'update') {
        this.updateRMAWithNotification(result.rma, isLoading);
      }
    });
  }

  openDeleteRMADialog(rma: RMA, isLoading: WritableSignal<boolean>): void {
    const rmaLabel = rma.rmaNumber || rma.id || 'RMA';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {
        userName: rmaLabel,
        userEmail: ''
      } as DeleteConfirmDialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteRMAWithNotification(rma.id!, isLoading);
      }
    });
  }

  addRMAItem(rmaId: string, productId: string, quantity: number, reason?: string): Observable<RMA> {
    return this.http.post<RMA>(`${this.apiUrl}/${rmaId}/items`, {
      productId,
      quantity,
      reason: reason || ''
    });
  }

  updateRMAItemQuantity(rmaId: string, itemId: string, quantity: number): Observable<RMA> {
    return this.http.put<RMA>(`${this.apiUrl}/${rmaId}/items/${itemId}/quantity`, {
      quantity
    });
  }

  updateRMAItemReturnedQuantity(rmaId: string, itemId: string, returnedQuantity: number): Observable<RMA> {
    return this.http.put<RMA>(`${this.apiUrl}/${rmaId}/items/${itemId}/returned-quantity`, {
      returnedQuantity
    });
  }

  removeRMAItem(rmaId: string, itemId: string): Observable<RMA> {
    return this.http.delete<RMA>(`${this.apiUrl}/${rmaId}/items/${itemId}`);
  }

  openAddRMAEntry(isLoading: WritableSignal<boolean>): void {
    // Navigate to RMA entry page instead of opening dialog
    this.router.navigate(['/rmas/new']);
  }

  openEditRMAEntry(rma: RMA, isLoading: WritableSignal<boolean>): void {
    // Navigate to RMA entry page instead of opening dialog
    if (rma.id) {
      this.router.navigate(['/rmas', rma.id]);
    }
  }
}

