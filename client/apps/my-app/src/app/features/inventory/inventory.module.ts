import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InventoryListComponent} from './components/inventory-list/inventory-list.component';
import {InventoryDialogComponent} from './components/inventory-dialog/inventory-dialog.component';

/**
 * Inventory module
 * Feature module for inventory-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InventoryListComponent,
    InventoryDialogComponent
  ],
  exports: [
    InventoryListComponent,
    InventoryDialogComponent
  ]
})
export class InventoryModule
{
}
