import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StoreService } from '../../../../core/store.service';
import { User } from '../../models/user';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { UserManagementService } from './user-management.service';
import { AxButtonComponent, AxProgressComponent } from '@ui/components';

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
    MatToolbarModule,
    MatTooltipModule,
    TranslateModule,
    AxButtonComponent,
    AxProgressComponent
],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['userid', 'lastName', 'firstName', 'email', 'role', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private userService = inject(UserManagementService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  // Expose JsonUtil to template
  JsonUtilRef = JsonUtil;

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
      this.displayedColumns.set(['userid', 'firstName', 'lastName', 'email', 'role', 'jsonData', 'actions']);
    } else {
      // Japanese: LastName, FirstName
      this.displayedColumns.set(['userid', 'lastName', 'firstName', 'email', 'role', 'jsonData', 'actions']);
    }
  }

  loadUsers(): void
  {
    this.userService.loadUsers(this.isLoading);
  }

  openAddUserDialog(): void
  {
    this.userService.openAddUserDialog(this.isLoading);
  }

  openEditUserDialog(user: User): void
  {
    this.userService.openEditUserDialog(user, this.isLoading);
  }

  deleteUser(user: User): void
  {
    this.userService.openDeleteUserDialog(user, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

}
