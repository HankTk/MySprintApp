import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseListComponent } from './components/warehouse-list/warehouse-list.component';
import { WarehouseDialogComponent } from './components/warehouse-dialog/warehouse-dialog.component';

/**
 * Warehouses module
 * Feature module for warehouse-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    WarehouseListComponent,
    WarehouseDialogComponent
  ],
  exports: [
    WarehouseListComponent,
    WarehouseDialogComponent
  ]
})
export class WarehousesModule
{
}