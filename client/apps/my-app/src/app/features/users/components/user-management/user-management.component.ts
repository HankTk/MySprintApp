import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../../../core/store.service';
import { User } from '../../models/user';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { UserManagementService } from './user-management.service';
import { 
  AxButtonComponent, 
  AxProgressComponent, 
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    TranslateModule,
    AxButtonComponent,
    AxProgressComponent,
    AxCardComponent,
    AxIconComponent,
    AxTableComponent,
    MatTableModule,
    MatCardModule,
    AxTooltipDirective
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['userid', 'lastName', 'firstName', 'email', 'role', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private userService = inject(UserManagementService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  users = this.store.select('users');

  ngOnInit(): void {
    this.loadUsers();
    this.updateColumnOrder();
    
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
      this.displayedColumns.set(['userid', 'firstName', 'lastName', 'email', 'role', 'jsonData', 'actions']);
    } else {
      this.displayedColumns.set(['userid', 'lastName', 'firstName', 'email', 'role', 'jsonData', 'actions']);
    }
  }

  loadUsers(): void {
    this.userService.loadUsers(this.isLoading);
  }

  openAddUserDialog(): void {
    this.userService.openAddUserDialog(this.isLoading);
  }

  openEditUserDialog(user: User): void {
    this.userService.openEditUserDialog(user, this.isLoading);
  }

  deleteUser(user: User): void {
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
