import { Component, OnInit, inject, OnDestroy, signal, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
  AxTableColumnDef,
  FilterOption,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
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
export class UserManagementComponent implements OnInit, OnDestroy, AfterViewInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['userid', 'lastName', 'firstName', 'email', 'role', 'jsonData', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding
  
  // Table-level flag: whether the table supports filtering
  tableFilterable = true;
  
  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<User>[]>([]);
  
  // Template references for custom cells
  @ViewChild('jsonDataCell') jsonDataCellTemplate?: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;
  
  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<User>;

  private store = inject(StoreService);
  private userService = inject(UserManagementService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  users = this.store.select('users');
  
  constructor() {
    // Reinitialize columns when users change (using effect)
    effect(() => {
      // Access signal to create dependency
      this.users();
      // Reinitialize columns if templates are available
      if (this.jsonDataCellTemplate) {
        this.initializeColumns();
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeColumns(): void {
    const isEnglish = this.languageService.isEnglish();
    this.columns.set([
      {
        key: 'userid',
        header: this.languageService.instant('userid'),
        field: 'userid',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: isEnglish ? 'firstName' : 'lastName',
        header: this.languageService.instant(isEnglish ? 'firstName' : 'lastName'),
        field: isEnglish ? 'firstName' : 'lastName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: isEnglish ? 'lastName' : 'firstName',
        header: this.languageService.instant(isEnglish ? 'lastName' : 'firstName'),
        field: isEnglish ? 'lastName' : 'firstName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'email',
        header: this.languageService.instant('emailAddress'),
        field: 'email',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'role',
        header: this.languageService.instant('role'),
        field: 'role',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'jsonData',
        header: this.languageService.instant('jsonData'),
        field: 'jsonData',
        sortable: false,
        filterable: false,
        cellTemplate: this.jsonDataCellTemplate
      },
      {
        key: 'actions',
        header: this.languageService.instant('actions'),
        field: 'id',
        sortable: false,
        filterable: false,
        cellTemplate: this.actionsCellTemplate
      }
    ]);
  }

  clearTableFilters(): void {
    if (this.axTable) {
      this.axTable.clearFilters();
    }
  }

  getClearFiltersLabel(): string {
    const translated = this.languageService.instant('clearFilters');
    // If translation returns the key itself, it means the key wasn't found
    return translated && translated !== 'clearFilters' ? translated : 'Clear Filters';
  }

  toggleFilters(): void {
    const currentValue = this.showFilters();
    const newValue = !currentValue;
    
    // Update both signal and property
    this.showFilters.set(newValue);
    this.showFilterValue = newValue;
    
    // Force change detection to ensure the binding is updated
    this.cdr.markForCheck();
    this.cdr.detectChanges();
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
    this.router.navigate(['/master']);
  }
}
