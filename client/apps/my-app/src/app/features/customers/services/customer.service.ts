import {Injectable, inject, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Customer, CreateCustomerRequest} from '../models/customer.model';
import {ResourceService} from '../../../shared/services/resource.service';
import {TranslateService} from '@ngx-translate/core';
import {CustomerDialogComponent, CustomerDialogData} from '../components/customer-dialog/customer-dialog.component';
import {
  DeleteConfirmDialogComponent,
  DeleteConfirmDialogData
} from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CustomerService
{
  private apiUrl = 'http://localhost:8080/api/customers';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getCustomers(): Observable<Customer[]>
  {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomer(id: string): Observable<Customer>
  {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: CreateCustomerRequest): Observable<Customer>
  {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: Customer): Observable<Customer>
  {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadCustomers(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
        'customers',
        isLoading,
        this.translate.instant('messages.failedToLoad', {resource: 'customers'})
    );
  }

  createCustomerWithNotification(
      customerData: CreateCustomerRequest,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.createResource(
        'customers',
        customerData,
        isLoading,
        this.translate.instant('messages.customerCreatedSuccessfully'),
        this.translate.instant('messages.failedToCreateCustomer')
    );
  }

  updateCustomerWithNotification(
      customerData: Customer,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.updateResource(
        'customers',
        customerData.id!,
        customerData,
        isLoading,
        this.translate.instant('messages.customerUpdatedSuccessfully'),
        this.translate.instant('messages.failedToUpdateCustomer')
    );
  }

  deleteCustomerWithNotification(
      id: string,
      isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.deleteResource(
        'customers',
        id,
        isLoading,
        this.translate.instant('messages.customerDeletedSuccessfully'),
        this.translate.instant('messages.failedToDeleteCustomer')
    );
  }

  openAddCustomerDialog(isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(CustomerDialogComponent,
        {
          data: {isEdit: false} as CustomerDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'create')
      {
        this.createCustomerWithNotification(result.customer, isLoading);
      }
    });
  }

  openEditCustomerDialog(customer: Customer, isLoading: WritableSignal<boolean>): void
  {
    const dialogRef = this.dialog.open(CustomerDialogComponent,
        {
          data: {customer, isEdit: true} as CustomerDialogData,
          width: '1200px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'update')
      {
        this.updateCustomerWithNotification(result.customer, isLoading);
      }
    });
  }

  openDeleteCustomerDialog(customer: Customer, isLoading: WritableSignal<boolean>): void
  {
    const customerName = customer.companyName || `${customer.lastName} ${customer.firstName}`;
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
        {
          data: {
            userName: customerName,
            userEmail: customer.email
          } as DeleteConfirmDialogData,
          width: '500px',
          maxWidth: '90vw',
          disableClose: true
        });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result === true)
      {
        this.deleteCustomerWithNotification(customer.id!, isLoading);
      }
    });
  }
}

