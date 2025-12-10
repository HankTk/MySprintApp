import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerDialogComponent } from './components/customer-dialog/customer-dialog.component';

/**
 * Customers module
 * Feature module for customer-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CustomerListComponent,
    CustomerDialogComponent
  ],
  exports: [
    CustomerListComponent,
    CustomerDialogComponent
  ]
})
export class CustomersModule { }

