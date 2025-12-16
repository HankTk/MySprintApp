import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { AxProgressComponent } from '@ui/components';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../../../core/store.service';
import { PurchaseOrder } from '../../../purchase-orders/models/purchase-order.model';
import { PurchaseOrderService } from '../../../purchase-orders/services/purchase-order.service';
import { VendorService } from '../../../vendors/services/vendor.service';
import { Vendor } from '../../../vendors/models/vendor.model';

@Component({
  selector: 'app-account-payable-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatToolbarModule,
    AxProgressComponent,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './account-payable-list.component.html',
  styleUrls: ['./account-payable-list.component.scss']
})
export class AccountPayableListComponent implements OnInit {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['invoiceNumber', 'poNumber', 'supplier', 'invoiceDate', 'invoiceAmount', 'paidAmount', 'outstanding', 'status', 'actions']);
  statusFilter = signal<string | null>(null);
  
  private store = inject(StoreService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private router = inject(Router);

  purchaseOrders = this.store.select('purchase-orders');
  vendors = this.store.select('vendors');

  // Filter POs that have been invoiced (INVOICED or PAID status)
  invoicedPOs = computed(() => {
    const pos = this.purchaseOrders() || [];
    return pos.filter((po: PurchaseOrder) => 
      po.status === 'INVOICED' || po.status === 'PAID'
    );
  });

  filteredPOs = computed(() => {
    const pos = this.invoicedPOs();
    const filter = this.statusFilter();
    if (filter) {
      return pos.filter((po: PurchaseOrder) => po.status === filter);
    }
    return pos;
  });

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadVendors();
  }

  private loadPurchaseOrders(): void {
    this.purchaseOrderService.loadPurchaseOrders(this.isLoading);
  }

  private loadVendors(): void {
    this.vendorService.loadVendors(this.isLoading);
  }

  getSupplierName(supplierId?: string): string {
    if (!supplierId) return 'N/A';
    const vendors = this.vendors() || [];
    const vendor = vendors.find((v: Vendor) => v.id === supplierId);
    return vendor ? (vendor.companyName || `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim() || vendor.email || 'N/A') : supplierId;
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

  calculateOutstandingAmount(po: PurchaseOrder): number {
    const total = po.total || 0;
    const paidAmount = po.jsonData?.paymentAmount || 0;
    return Math.max(0, total - paidAmount);
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'INVOICED':
        return '#8B5CF6'; // Purple
      case 'PAID':
        return '#047857'; // Dark green
      default:
        return '#6B7280'; // Gray
    }
  }

  getStatusBackgroundColor(status?: string): string {
    switch (status) {
      case 'INVOICED':
        return '#EDE9FE'; // Light purple
      case 'PAID':
        return '#D1FAE5'; // Light green
      default:
        return '#F3F4F6'; // Light gray
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'INVOICED':
        return 'Invoiced';
      case 'PAID':
        return 'Paid';
      default:
        return status || 'N/A';
    }
  }

  viewInvoice(po: PurchaseOrder): void {
    this.router.navigate(['/account-payable', po.id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

