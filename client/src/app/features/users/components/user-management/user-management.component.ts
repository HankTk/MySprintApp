import { Component, OnInit, inject, OnDestroy, signal, computed } from '@angular/core';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from '../../../../core/data.service';
import { StoreService } from '../../../../core/store.service';
import { ResourceService, ResourceHooks } from '../../../../shared/services/resource.service';
import { User, CreateUserRequest } from '../../models/user';
import { UserDialogComponent, UserDialogData } from '../user-dialog/user-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';
import { LanguageSwitcherComponent } from '../../../../shared/components/language-switcher/language-switcher.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
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
export class UserManagementComponent implements OnInit, OnDestroy
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['lastName', 'firstName', 'email', 'jsonData', 'actions']);

  private data = inject(DataService);
  private store = inject(StoreService);
  private resourceManager = inject(ResourceService);
  private dialog = inject(MatDialog);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  private subscriptions = new Subscription();

  users = this.store.select('users'); // <- Signal getter

  ngOnInit(): void
  {
    this.loadUsers();
    this.updateColumnOrder();
    
    // Subscribe to language changes
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(() => {
        this.updateColumnOrder();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateColumnOrder(): void {
    if (this.languageService.isEnglish()) {
      // English: FirstName, LastName
      this.displayedColumns.set(['firstName', 'lastName', 'email', 'jsonData', 'actions']);
    } else {
      // Japanese: LastName, FirstName
      this.displayedColumns.set(['lastName', 'firstName', 'email', 'jsonData', 'actions']);
    }
  }

  loadUsers(): void
  {
    this.resourceManager.loadResource(
      'users',
      this.isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'users' })
    );
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
    const resourceHooks: ResourceHooks = {
      onSuccess: (user) => {
        // Custom processing after user creation
        console.log('User created:', user);
        // Reload user list after creation
        this.loadUsers();
      }
    };

    this.resourceManager.createResource(
      'users',
      userData,
      this.isLoading,
      this.translate.instant('messages.userCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateUser'),
      resourceHooks
    );
  }

  private updateUser(userData: User): void
  {
    this.resourceManager.updateResource(
      'users',
      userData.id!,
      userData,
      this.isLoading,
      this.translate.instant('messages.userUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateUser')
    );
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
    this.resourceManager.deleteResource(
      'users',
      id,
      this.isLoading,
      this.translate.instant('messages.userDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteUser')
    );
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

}
