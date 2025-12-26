import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RMAListComponent } from './components/rma-list/rma-list.component';
import { RMADialogComponent } from './components/rma-dialog/rma-dialog.component';

/**
 * RMAs module
 * Feature module for RMA-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RMAListComponent,
    RMADialogComponent
  ],
  exports: [
    RMAListComponent,
    RMADialogComponent
  ]
})
export class RMAsModule
{
}
