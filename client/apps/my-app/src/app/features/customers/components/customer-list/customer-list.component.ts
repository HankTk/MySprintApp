import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StoreService } from '../../../../core/store.service';
import { Customer } from '../../models/customer.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-list',
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
    TranslateModule
  ],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['customerNumber', 'companyName', 'lastName', 'firstName', 'email', 'phone', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private customerService = inject(CustomerService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  customers = this.store.select('customers');

  ngOnInit(): void {
    this.loadCustomers();
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
      this.displayedColumns.set(['customerNumber', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'jsonData', 'actions']);
    } else {
      this.displayedColumns.set(['customerNumber', 'companyName', 'lastName', 'firstName', 'email', 'phone', 'jsonData', 'actions']);
    }
  }

  loadCustomers(): void {
    this.customerService.loadCustomers(this.isLoading);
  }

  openAddCustomerDialog(): void {
    this.customerService.openAddCustomerDialog(this.isLoading);
  }

  openEditCustomerDialog(customer: Customer): void {
    this.customerService.openEditCustomerDialog(customer, this.isLoading);
  }

  deleteCustomer(customer: Customer): void {
    this.customerService.openDeleteCustomerDialog(customer, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

