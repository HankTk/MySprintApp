import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Address, CreateAddressRequest } from '../models/address.model';
import { ResourceService } from '../../../shared/services/resource.service';
import { TranslateService } from '@ngx-translate/core';
import { AddressDialogComponent, AddressDialogData } from '../components/address-dialog/address-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/addresses';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  getAddress(id: string): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  getAddressesByCustomerId(customerId: string): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/customer/${customerId}`);
  }

  createAddress(address: CreateAddressRequest): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address);
  }

  updateAddress(id: string, address: Address): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadAddresses(isLoading: WritableSignal<boolean>): void {
    this.resourceManager.loadResource(
      'addresses',
      isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'addresses' })
    );
  }

  createAddressWithNotification(
    addressData: CreateAddressRequest,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.createResource(
      'addresses',
      addressData,
      isLoading,
      this.translate.instant('messages.addressCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateAddress')
    );
  }

  updateAddressWithNotification(
    addressData: Address,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.updateResource(
      'addresses',
      addressData.id!,
      addressData,
      isLoading,
      this.translate.instant('messages.addressUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateAddress')
    );
  }

  deleteAddressWithNotification(
    id: string,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.deleteResource(
      'addresses',
      id,
      isLoading,
      this.translate.instant('messages.addressDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteAddress')
    );
  }

  openAddAddressDialog(isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      data: { isEdit: false } as AddressDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'create') {
        this.createAddressWithNotification(result.address, isLoading);
      }
    });
  }

  openEditAddressDialog(address: Address, isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      data: { address, isEdit: true } as AddressDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'update') {
        this.updateAddressWithNotification(result.address, isLoading);
      }
    });
  }

  openDeleteAddressDialog(address: Address, isLoading: WritableSignal<boolean>): void {
    const addressLabel = address.streetAddress1 || address.id || 'Address';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {
        userName: addressLabel,
        userEmail: address.contactPhone
      } as DeleteConfirmDialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteAddressWithNotification(address.id!, isLoading);
      }
    });
  }
}

