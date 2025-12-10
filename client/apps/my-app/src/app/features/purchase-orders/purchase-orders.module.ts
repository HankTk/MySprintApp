import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderListComponent } from './components/po-list/po-list.component';
import { PurchaseOrderDialogComponent } from './components/po-dialog/po-dialog.component';

/**
 * Purchase Orders module
 * Feature module for purchase order-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PurchaseOrderListComponent,
    PurchaseOrderDialogComponent
  ],
  exports: [
    PurchaseOrderListComponent,
    PurchaseOrderDialogComponent
  ]
})
export class PurchaseOrdersModule { }

