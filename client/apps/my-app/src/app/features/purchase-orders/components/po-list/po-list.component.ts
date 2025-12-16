import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AxButtonComponent, AxProgressComponent } from '@ui/components';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StoreService } from '../../../../core/store.service';
import { PurchaseOrder } from '../../models/purchase-order.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    AxButtonComponent,
    AxProgressComponent,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss']
})
export class PurchaseOrderListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['orderNumber', 'supplierId', 'orderDate', 'status', 'total', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private purchaseOrderService = inject(PurchaseOrderService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  purchaseOrders = this.store.select('purchase-orders');

  ngOnInit(): void {
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
}

