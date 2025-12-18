import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { StoreService } from '../../../../core/store.service';
import { PurchaseOrder } from '../../models/purchase-order.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { VendorService } from '../../../vendors/services/vendor.service';
import { Vendor } from '../../../vendors/models/vendor.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
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
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss']
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['orderNumber', 'supplierName', 'orderDate', 'status', 'total', 'actions']);
  vendors = signal<Vendor[]>([]);

  private store = inject(StoreService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  purchaseOrders = this.store.select('purchase-orders');

  async ngOnInit(): Promise<void> {
    await this.loadVendors();
    this.loadPurchaseOrders();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadPurchaseOrders(): void {
    this.purchaseOrderService.loadPurchaseOrders(this.isLoading);
  }

  openAddPurchaseOrderDialog(): void {
    this.purchaseOrderService.openAddPurchaseOrderEntry(this.isLoading);
  }

  openEditPurchaseOrderDialog(po: PurchaseOrder): void {
    this.purchaseOrderService.openEditPurchaseOrderEntry(po, this.isLoading);
  }

  deletePurchaseOrder(po: PurchaseOrder): void {
    this.purchaseOrderService.openDeletePurchaseOrderDialog(po, this.isLoading);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private async loadVendors(): Promise<void> {
    try {
      const vendors = await firstValueFrom(this.vendorService.getVendors());
      this.vendors.set(vendors);
    } catch (err) {
      console.error('Error loading vendors:', err);
    }
  }

  getSupplierName(supplierId?: string): string {
    if (!supplierId) return 'N/A';
    const vendors = this.vendors() || [];
    const vendor = vendors.find((v: Vendor) => v.id === supplierId);
    if (vendor) {
      return vendor.companyName || `${vendor.lastName} ${vendor.firstName}` || vendor.email || supplierId;
    }
    return supplierId;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }
}

