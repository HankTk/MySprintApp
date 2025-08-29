import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../services/user.service';
import { User, CreateUserRequest } from '../../models/user';
import { UserDialogComponent, UserDialogData } from '../user-dialog/user-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    LanguageSwitcherComponent,
    TranslateModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit
{
  users: User[] = [];
  isLoading = false;
  displayedColumns: string[] = ['lastName', 'firstName', 'email', 'jsonData', 'actions'];

  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void
  {
    this.loadUsers();
  }

  loadUsers(): void
  {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) =>
      {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) =>
      {
        this.showSnackBar('Failed to load users', 'error');
        this.isLoading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  openAddUserDialog(): void
  {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      data: { isEdit: false } as UserDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'create')
      {
        this.createUser(result.user);
      }
    });
  }

  openEditUserDialog(user: User): void
  {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      data: { user, isEdit: true } as UserDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result && result.action === 'update')
      {
        this.updateUser(result.user);
      }
    });
  }

  private createUser(userData: CreateUserRequest): void
  {
    console.log('Creating user with data:', userData);
    this.userService.createUser(userData).subscribe({
      next: (user) =>
      {
        console.log('User created successfully:', user);
        this.users = [...this.users, user]; // Change array reference to ensure Angular change detection
        console.log('Updated users array:', this.users);
        this.showSnackBar('User created successfully', 'success');
        // Reload user list to ensure display is updated
        this.loadUsers();
      },
      error: (error) =>
      {
        console.error('Error creating user:', error);
        this.showSnackBar('Failed to create user', 'error');
      }
    });
  }

  private updateUser(userData: User): void
  {
    if (userData.id)
    {
      this.userService.updateUser(userData.id, userData).subscribe({
        next: (updatedUser) =>
        {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1)
          {
            this.users = [...this.users.slice(0, index), updatedUser, ...this.users.slice(index + 1)];
          }
          this.showSnackBar('User updated successfully', 'success');
        },
        error: (error) =>
        {
          this.showSnackBar('Failed to update user', 'error');
          console.error('Error updating user:', error);
        }
      });
    }
  }

  deleteUser(user: User): void
  {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {
        userName: `${user.lastName} ${user.firstName}`,
        userEmail: user.email
      } as DeleteConfirmDialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result === true)
      {
        // If deletion is confirmed
        this.performDelete(user.id);
      }
    });
  }

  private performDelete(id: string): void
  {
    this.userService.deleteUser(id).subscribe({
      next: () =>
      {
        this.users = this.users.filter(u => u.id !== id);
        this.showSnackBar('User deleted successfully', 'success');
      },
      error: (error) =>
      {
        this.showSnackBar('Failed to delete user', 'error');
        console.error('Error deleting user:', error);
      }
    });
  }

  formatJsonData(jsonData: any): string
  {
    try
    {
      if (typeof jsonData === 'string')
      {
        return JSON.stringify(JSON.parse(jsonData), null, 2);
      }
      else
      {
        return JSON.stringify(jsonData, null, 2);
      }
    }
    catch
    {
      return String(jsonData);
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void
  {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? 'success-snackbar' : 'error-snackbar'
    });
  }
}
