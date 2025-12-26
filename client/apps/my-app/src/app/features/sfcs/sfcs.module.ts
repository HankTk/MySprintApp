import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SFCListComponent } from './components/sfc-list/sfc-list.component';
import { SFCDialogComponent } from './components/sfc-dialog/sfc-dialog.component';

/**
 * SFCs module
 * Feature module for SFC-related functionality
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SFCListComponent,
    SFCDialogComponent
  ],
  exports: [
    SFCListComponent,
    SFCDialogComponent
  ]
})
export class SFCsModule
{
}
