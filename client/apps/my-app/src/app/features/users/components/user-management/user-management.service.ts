import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { User, CreateUserRequest } from '../../models/user';
import { ResourceService } from '../../../../shared/services/resource.service';
import { TranslateService } from '@ngx-translate/core';
import { UserDialogComponent, UserDialogData } from '../user-dialog/user-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService
{
  // Direct backend URL - bypasses proxy issues
  private apiUrl = 'http://localhost:8080/api/users';

  private http = inject(HttpClient);
  private resourceManager = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getUsers(): Observable<User[]>
  {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUser(id: string): Observable<User>
  {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<User>
  {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: string, user: User): Observable<User>
  {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void>
  {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Business logic methods that handle loading states and notifications
  loadUsers(isLoading: WritableSignal<boolean>): void
  {
    this.resourceManager.loadResource(
      'users',
      isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'users' })
    );
  }

  createUserWithNotification(
    userData: CreateUserRequest,
    isLoading: WritableSignal<boolean>
  ): void
  {
    // Data will be automatically updated via WebSocket notification, so no need to reload
    this.resourceManager.createResource(
      'users',
      userData,
      isLoading,
      this.translate.instant('messages.userCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateUser')
    );
  }

  updateUserWithNotification(
    userData: User,
    isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.updateResource(
      'users',
      userData.id!,
      userData,
      isLoading,
      this.translate.instant('messages.userUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateUser')
    );
  }

  deleteUserWithNotification(
    id: string,
    isLoading: WritableSignal<boolean>
  ): void
  {
    this.resourceManager.deleteResource(
      'users',
      id,
      isLoading,
      this.translate.instant('messages.userDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteUser')
    );
  }

  // Dialog handling methods
  openAddUserDialog(isLoading: WritableSignal<boolean>): void
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
        this.createUserWithNotification(result.user, isLoading);
      }
    });
  }

  openEditUserDialog(user: User, isLoading: WritableSignal<boolean>): void
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
        this.updateUserWithNotification(result.user, isLoading);
      }
    });
  }

  openDeleteUserDialog(user: User, isLoading: WritableSignal<boolean>): void
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
        this.deleteUserWithNotification(user.id!, isLoading);
      }
    });
  }
}
