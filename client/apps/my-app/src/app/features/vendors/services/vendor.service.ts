import {Injectable, inject, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Vendor, CreateVendorRequest} from '../models/vendor.model';
import {ResourceService} from '../../../shared/services/resource.service';
import {TranslateService} from '@ngx-translate/core';
import {VendorDialogComponent, VendorDialogData} from '../components/vendor-dialog/vendor-dialog.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData
} from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class VendorService
{
  private apiUrl = 'http://localhost:8080/api/vendors';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getVendors(): Observable<Vendor[]>
  {
    return this.http.get<Vendor[]>(this.apiUrl);
  }

  getVendor(id: string): Observable<Vendor>
  {
    return this.http.get<Vendor>(`${this.apiUrl}/${id}`);
  }

  createVendor(vendor: CreateVendorRequest): Observable<Vendor>
  {
    return this.http.post<Vendor>(this.apiUrl, vendor);
  }

  updateVendor(id: string, vendor: Vendor): Observable<Vendor>
  {
    return this.http.put<Vendor>(`${this.apiUrl}/${id}`, vendor);
  }

  deleteVendor(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadVendors(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
        'vendors',
        isLoading,
        this.translate.instant('messages.failedToLoad', {resource: 'vendors'})
    );
  }

  createVendorWithNotification(
      vendorData: CreateVendorRequest,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.createResource(
        'vendors',
        vendorData,
        isLoading,
        this.translate.instant('messages.vendorCreatedSuccessfully'),
        this.translate.instant('messages.failedToCreateVendor')
    );
  }

  updateVendorWithNotification(
      vendorData: Vendor,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.updateResource(
        'vendors',
        vendorData.id!,
        vendorData,
        isLoading,
        this.translate.instant('messages.vendorUpdatedSuccessfully'),
        this.translate.instant('messages.failedToUpdateVendor')
    );
  }

  deleteVendorWithNotification(
      id: string,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.deleteResource(
        'vendors',
        id,
        isLoading,
        this.translate.instant('messages.vendorDeletedSuccessfully'),
        this.translate.instant('messages.failedToDeleteVendor')
    );
  }

  openAddVendorDialog(isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(VendorDialogComponent,
        {
          data: {isEdit: false} as VendorDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'create')
      {
        this.createVendorWithNotification(result.vendor, isLoading);
      }
    });
  }

  openEditVendorDialog(vendor: Vendor, isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(VendorDialogComponent,
        {
          data: {vendor, isEdit: true} as VendorDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'update')
      {
        this.updateVendorWithNotification(result.vendor, isLoading);
      }
    });
  }

  openDeleteVendorDialog(vendor: Vendor, isLoading: WritableSignal<boolean>): void
  {
    const vendorName = vendor.companyName || `${vendor.lastName} ${vendor.firstName}`;
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
        {
          data: {
            userName: vendorName,
            userEmail: vendor.email
          } as DeleteConfirmDialogData,
          width: '500px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result === true)
      {
        this.deleteVendorWithNotification(vendor.id!, isLoading);
      }
    });
  }
}

