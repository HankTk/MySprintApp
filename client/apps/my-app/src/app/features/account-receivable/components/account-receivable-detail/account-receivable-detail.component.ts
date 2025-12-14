import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { KeyValuePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { StoreService } from '../../../../core/store.service';
import { Order } from '../../../orders/models/order.model';
import { OrderService } from '../../../orders/services/order.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { Customer } from '../../../customers/models/customer.model';
import { AddressService } from '../../../addresses/services/address.service';
import { Address } from '../../../addresses/models/address.model';

type AccountReceivableStep = 'invoice' | 'payment' | 'history';

interface HistoryRecord {
  step: string;
  status: string;
  timestamp: string;
  note?: string;
  data?: Record<string, any>;
}

@Component({
  selector: 'app-account-receivable-detail',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    KeyValuePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './account-receivable-detail.component.html',
  styleUrls: ['./account-receivable-detail.component.scss']
})
export class AccountReceivableDetailComponent implements OnInit {
  currentStep = signal<AccountReceivableStep>('invoice');
  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  paymentAmount = signal<number>(0);
  paymentDate = signal<Date | null>(null);
  paymentMethod = signal<string>('');

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(StoreService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private addressService = inject(AddressService);

  orders = this.store.select('orders');
  customers = this.store.select('customers');
  addresses = signal<Address[]>([]);

  selectedCustomer = computed(() => {
    const order = this.order();
    if (!order?.customerId) return null;
    return this.customers().find((c: Customer) => c.id === order.customerId) || null;
  });

  outstandingAmount = computed(() => {
    const order = this.order();
    const payment = this.paymentAmount();
    return Math.max(0, (order?.total || 0) - payment);
  });

  orderHistory = computed(() => {
    const order = this.order();
    if (!order?.jsonData?.history) return [];
    const allHistory = order.jsonData.history as HistoryRecord[];
    return allHistory.filter(record => {
      if (record.step === 'invoicing' || record.step === 'payment') {
        return true;
      }
      if (record.step === 'status_change' && record.data) {
        const newStatus = record.data['newStatus'];
        return newStatus === 'INVOICED' || newStatus === 'PAID';
      }
      return false;
    });
  });

  displayedColumns = ['product', 'quantity', 'unitPrice', 'lineTotal'];

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadOrder(invoiceId);
    }
  }

  private async loadOrder(id: string): Promise<void> {
    try {
      this.loading.set(true);
      const order = await firstValueFrom(this.orderService.getOrder(id));
      if (order) {
        this.order.set(order);
        
        // Load payment data from jsonData
        if (order.jsonData) {
          this.paymentAmount.set(order.jsonData.paymentAmount || 0);
          const paymentDateStr = order.jsonData.paymentDate;
          this.paymentDate.set(paymentDateStr ? new Date(paymentDateStr) : null);
          this.paymentMethod.set(order.jsonData.paymentMethod || '');
        }
        
        // Load addresses if customer exists
        if (order.customerId) {
          await this.loadAddresses(order.customerId);
        }
        
        // Set initial step based on order status
        if (order.status === 'PAID' || (order.jsonData?.paymentAmount && order.jsonData.paymentAmount > 0)) {
          this.currentStep.set('history');
        } else if (order.status === 'INVOICED') {
          this.currentStep.set('payment');
        } else {
          this.currentStep.set('invoice');
        }
      }
    } catch (err) {
      console.error('Error loading order:', err);
      this.order.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadAddresses(customerId: string): Promise<void> {
    try {
      const addresses = await firstValueFrom(this.addressService.getAddressesByCustomerId(customerId));
      this.addresses.set(addresses);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  }

  async handlePayment(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      this.submitting.set(true);
      const jsonData = order.jsonData || {};
      jsonData.paymentAmount = this.paymentAmount();
      jsonData.paymentDate = this.paymentDate() ? this.paymentDate()!.toISOString().split('T')[0] : null;
      jsonData.paymentMethod = this.paymentMethod();
      
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          status: this.paymentAmount() >= (order.total || 0) ? 'PAID' : 'INVOICED',
          jsonData
        })
      );
      
      if (updated) {
        this.order.set(updated);
        
        // Add history record
        const history = jsonData.history || [];
        const newRecord: HistoryRecord = {
          step: 'payment',
          status: this.paymentAmount() >= (order.total || 0) ? 'PAID' : 'INVOICED',
          timestamp: new Date().toISOString(),
          note: `Payment recorded: $${this.paymentAmount().toFixed(2)}`,
          data: {
            paymentAmount: this.paymentAmount(),
            paymentDate: this.paymentDate() ? this.paymentDate()!.toISOString().split('T')[0] : null,
            paymentMethod: this.paymentMethod()
          }
        };
        jsonData.history = [...history, newRecord];
        
        const finalUpdated = await firstValueFrom(
          this.orderService.updateOrder(order.id, {
            ...updated,
            jsonData
          })
        );
        
        if (finalUpdated) {
          this.order.set(finalUpdated);
          this.currentStep.set('history');
          alert('Payment recorded successfully!');
        }
      }
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Failed to record payment');
    } finally {
      this.submitting.set(false);
    }
  }

  getCustomerName(): string {
    const customer = this.selectedCustomer();
    if (!customer) return 'N/A';
    return customer.companyName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email || 'N/A';
  }

  formatDate(dateString?: string | Date): string {
    if (!dateString) return 'N/A';
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return String(dateString);
    }
  }

  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getStepLabel(step: string): string {
    const stepLabels: Record<string, string> = {
      'invoicing': 'accountsReceivable.history.stepLabels.invoicing',
      'payment': 'accountsReceivable.history.stepLabels.payment',
      'status_change': 'accountsReceivable.history.stepLabels.statusChange'
    };
    return stepLabels[step] || step;
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
      'INVOICED': 'accountsReceivable.history.statusLabels.invoiced',
      'PAID': 'accountsReceivable.history.statusLabels.paid'
    };
    return statusMap[status] || status;
  }

  getDataKeyLabel(key: string): string {
    const keyMap: Record<string, string> = {
      'invoiceNumber': 'accountsReceivable.history.dataLabels.invoiceNumber',
      'invoiceDate': 'accountsReceivable.history.dataLabels.invoiceDate',
      'paymentAmount': 'accountsReceivable.history.dataLabels.paymentAmount',
      'paymentDate': 'accountsReceivable.history.dataLabels.paymentDate',
      'paymentMethod': 'accountsReceivable.history.dataLabels.paymentMethod',
      'oldStatus': 'accountsReceivable.history.dataLabels.oldStatus',
      'newStatus': 'accountsReceivable.history.dataLabels.newStatus'
    };
    return keyMap[key] || key;
  }

  formatDataValue(key: string, value: any): string {
    // Handle null or undefined
    if (value == null) {
      return 'N/A';
    }
    
    // Handle objects - convert to JSON string
    if (typeof value === 'object' && !(value instanceof Date)) {
      try {
        return JSON.stringify(value);
      } catch {
        return 'N/A';
      }
    }
    
    if (key === 'oldStatus' || key === 'newStatus') {
      return this.getStatusLabel(String(value));
    }
    if (key === 'paymentMethod') {
      const methodMap: Record<string, string> = {
        'BANK_TRANSFER': 'accountsReceivable.payment.method.bankTransfer',
        'CREDIT_CARD': 'accountsReceivable.payment.method.creditCard',
        'CASH': 'accountsReceivable.payment.method.cash',
        'CHECK': 'accountsReceivable.payment.method.check',
        'OTHER': 'accountsReceivable.payment.method.other'
      };
      return methodMap[String(value)] || String(value);
    }
    if (key === 'paymentAmount' && typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
    if ((key === 'invoiceDate' || key === 'paymentDate') && value) {
      return this.formatDate(String(value));
    }
    return String(value);
  }

  isStepCompleted(step: AccountReceivableStep): boolean {
    const order = this.order();
    if (!order) return false;
    switch (step) {
      case 'invoice':
        return !!order.invoiceNumber;
      case 'payment':
        return order.status === 'PAID' || this.paymentAmount() > 0;
      case 'history':
        return this.orderHistory().length > 0;
      default:
        return false;
    }
  }

  goBack(): void {
    this.router.navigate(['/account-receivable']);
  }

  hasDataKeys(data?: Record<string, any>): boolean {
    return data ? Object.keys(data).length > 0 : false;
  }

  toString(value: string | number | symbol): string {
    return String(value);
  }
}

