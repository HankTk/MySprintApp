import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserDialogComponent } from './components/user-dialog/user-dialog.component';

/**
 * Users module
 * Feature module for user-related functionality
 * Note: This is optional in standalone Angular applications
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserManagementComponent,
    UserDialogComponent
  ],
  exports: [
    UserManagementComponent,
    UserDialogComponent
  ]
})
export class UsersModule { }
