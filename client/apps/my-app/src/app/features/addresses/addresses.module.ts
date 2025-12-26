import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressListComponent } from './components/address-list/address-list.component';
import { AddressDialogComponent } from './components/address-dialog/address-dialog.component';

/**
 * Addresses module
 * Feature module for address-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AddressListComponent,
    AddressDialogComponent
  ],
  exports: [
    AddressListComponent,
    AddressDialogComponent
  ]
})
export class AddressesModule
{
}
