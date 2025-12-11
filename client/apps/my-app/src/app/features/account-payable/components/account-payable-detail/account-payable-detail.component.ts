import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { StoreService } from '../../../../core/store.service';
import { PurchaseOrder } from '../../../purchase-orders/models/purchase-order.model';
import { PurchaseOrderService } from '../../../purchase-orders/services/purchase-order.service';
import { VendorService } from '../../../vendors/services/vendor.service';
import { Vendor } from '../../../vendors/models/vendor.model';

type AccountPayableStep = 'invoice' | 'payment' | 'history';

interface HistoryRecord {
  step: string;
  status: string;
  timestamp: string;
  note?: string;
  data?: Record<string, any>;
}

@Component({
  selector: 'app-account-payable-detail',
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
    MatTableModule,
    MatChipsModule,
    TranslateModule
  ],
  templateUrl: './account-payable-detail.component.html',
  styleUrls: ['./account-payable-detail.component.scss']
})
export class AccountPayableDetailComponent implements OnInit {
  currentStep = signal<AccountPayableStep>('invoice');
  po = signal<PurchaseOrder | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  paymentAmount = signal<number>(0);
  paymentDate = signal<string>('');
  paymentMethod = signal<string>('');

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(StoreService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);

  purchaseOrders = this.store.select('purchase-orders');
  vendors = this.store.select('vendors');

  selectedSupplier = computed(() => {
    const po = this.po();
    if (!po?.supplierId) return null;
    return this.vendors().find((v: Vendor) => v.id === po.supplierId) || null;
  });

  outstandingAmount = computed(() => {
    const po = this.po();
    const payment = this.paymentAmount();
    return Math.max(0, (po?.total || 0) - payment);
  });

  poHistory = computed(() => {
    const po = this.po();
    if (!po?.jsonData?.history) return [];
    const allHistory = po.jsonData.history as HistoryRecord[];
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
      this.loadPurchaseOrder(invoiceId);
    }
  }

  private async loadPurchaseOrder(id: string): Promise<void> {
    try {
      this.loading.set(true);
      const po = await firstValueFrom(this.purchaseOrderService.getPurchaseOrder(id));
      if (po) {
        this.po.set(po);
        
        // Load payment data from jsonData
        if (po.jsonData) {
          this.paymentAmount.set(po.jsonData.paymentAmount || 0);
          this.paymentDate.set(po.jsonData.paymentDate || '');
          this.paymentMethod.set(po.jsonData.paymentMethod || '');
        }
        
        // Set initial step based on PO status
        if (po.status === 'PAID' || (po.jsonData?.paymentAmount && po.jsonData.paymentAmount > 0)) {
          this.currentStep.set('history');
        } else if (po.status === 'INVOICED') {
          this.currentStep.set('payment');
        } else {
          this.currentStep.set('invoice');
        }
      }
    } catch (err) {
      console.error('Error loading purchase order:', err);
      this.po.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async handlePayment(): Promise<void> {
    const po = this.po();
    if (!po || !po.id) return;

    try {
      this.submitting.set(true);
      const jsonData = po.jsonData || {};
      jsonData.paymentAmount = this.paymentAmount();
      jsonData.paymentDate = this.paymentDate();
      jsonData.paymentMethod = this.paymentMethod();
      
      const updated = await firstValueFrom(
        this.purchaseOrderService.updatePurchaseOrder(po.id, {
          ...po,
          status: this.paymentAmount() >= (po.total || 0) ? 'PAID' : 'INVOICED',
          jsonData
        })
      );
      
      if (updated) {
        this.po.set(updated);
        
        // Add history record
        const history = jsonData.history || [];
        const newRecord: HistoryRecord = {
          step: 'payment',
          status: this.paymentAmount() >= (po.total || 0) ? 'PAID' : 'INVOICED',
          timestamp: new Date().toISOString(),
          note: `Payment recorded: $${this.paymentAmount().toFixed(2)}`,
          data: {
            paymentAmount: this.paymentAmount(),
            paymentDate: this.paymentDate(),
            paymentMethod: this.paymentMethod()
          }
        };
        jsonData.history = [...history, newRecord];
        
        const finalUpdated = await firstValueFrom(
          this.purchaseOrderService.updatePurchaseOrder(po.id, {
            ...updated,
            jsonData
          })
        );
        
        if (finalUpdated) {
          this.po.set(finalUpdated);
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

  getSupplierName(): string {
    const supplier = this.selectedSupplier();
    if (!supplier) return 'N/A';
    return supplier.companyName || `${supplier.firstName || ''} ${supplier.lastName || ''}`.trim() || supplier.email || 'N/A';
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
      'invoicing': 'accountsPayable.history.step.invoicing',
      'payment': 'accountsPayable.history.step.payment',
      'status_change': 'accountsPayable.history.step.statusChange'
    };
    return stepLabels[step] || step;
  }

  getStatusLabel(status?: string): string {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
      'INVOICED': 'accountsPayable.history.status.invoiced',
      'PAID': 'accountsPayable.history.status.paid'
    };
    return statusMap[status] || status;
  }

  getDataKeyLabel(key: string): string {
    const keyMap: Record<string, string> = {
      'invoiceNumber': 'accountsPayable.history.data.invoiceNumber',
      'invoiceDate': 'accountsPayable.history.data.invoiceDate',
      'paymentAmount': 'accountsPayable.history.data.paymentAmount',
      'paymentDate': 'accountsPayable.history.data.paymentDate',
      'paymentMethod': 'accountsPayable.history.data.paymentMethod',
      'oldStatus': 'accountsPayable.history.data.oldStatus',
      'newStatus': 'accountsPayable.history.data.newStatus'
    };
    return keyMap[key] || key;
  }

  formatDataValue(key: string, value: any): string {
    if (key === 'oldStatus' || key === 'newStatus') {
      return this.getStatusLabel(String(value));
    }
    if (key === 'paymentMethod') {
      const methodMap: Record<string, string> = {
        'BANK_TRANSFER': 'accountsPayable.payment.method.bankTransfer',
        'CREDIT_CARD': 'accountsPayable.payment.method.creditCard',
        'CASH': 'accountsPayable.payment.method.cash',
        'CHECK': 'accountsPayable.payment.method.check',
        'OTHER': 'accountsPayable.payment.method.other'
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

  isStepCompleted(step: AccountPayableStep): boolean {
    const po = this.po();
    if (!po) return false;
    switch (step) {
      case 'invoice':
        return !!po.invoiceNumber;
      case 'payment':
        return po.status === 'PAID' || this.paymentAmount() > 0;
      case 'history':
        return this.poHistory().length > 0;
      default:
        return false;
    }
  }

  goBack(): void {
    this.router.navigate(['/account-payable']);
  }

  hasDataKeys(data?: Record<string, any>): boolean {
    return data ? Object.keys(data).length > 0 : false;
  }

  toString(value: string | number | symbol): string {
    return String(value);
  }
}

