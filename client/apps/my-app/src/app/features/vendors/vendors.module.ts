import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorListComponent } from './components/vendor-list/vendor-list.component';
import { VendorDialogComponent } from './components/vendor-dialog/vendor-dialog.component';

/**
 * Vendors module
 * Feature module for vendor-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    VendorListComponent,
    VendorDialogComponent
  ],
  exports: [
    VendorListComponent,
    VendorDialogComponent
  ]
})
export class VendorsModule
{
}
