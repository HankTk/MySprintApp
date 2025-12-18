import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../../../core/store.service';
import { Inventory } from '../../models/inventory.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../../products/services/product.service';
import { WarehouseService } from '../../../warehouses/services/warehouse.service';
import { Product } from '../../../products/models/product.model';
import { Warehouse } from '../../../warehouses/models/warehouse.model';
import { firstValueFrom } from 'rxjs';
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
  selector: 'app-inventory-list',
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
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['productId', 'warehouseId', 'quantity', 'jsonData', 'actions']);
  products = signal<Product[]>([]);
  warehouses = signal<Warehouse[]>([]);

  private store = inject(StoreService);
  private inventoryService = inject(InventoryService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  inventory = this.store.select('inventory');

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadProducts(),
      this.loadWarehouses()
    ]);
    this.loadInventory();
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await firstValueFrom(this.productService.getProducts());
      this.products.set(products);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  private async loadWarehouses(): Promise<void> {
    try {
      const warehouses = await firstValueFrom(this.warehouseService.getWarehouses());
      this.warehouses.set(warehouses);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  }

  getProductDisplay(productId?: string): string {
    if (!productId) return '-';
    const product = this.products().find(p => p.id === productId);
    if (product) {
      if (product.productName && product.productCode) {
        return `${product.productCode} - ${product.productName}`;
      }
      return product.productName || product.productCode || productId;
    }
    return productId;
  }

  getWarehouseDisplay(warehouseId?: string): string {
    if (!warehouseId) return '-';
    const warehouse = this.warehouses().find(w => w.id === warehouseId);
    if (warehouse) {
      if (warehouse.warehouseName && warehouse.warehouseCode) {
        return `${warehouse.warehouseCode} - ${warehouse.warehouseName}`;
      }
      return warehouse.warehouseName || warehouse.warehouseCode || warehouseId;
    }
    return warehouseId;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadInventory(): void {
    this.inventoryService.loadInventory(this.isLoading);
  }

  openAddInventoryDialog(): void {
    this.inventoryService.openAddInventoryDialog(this.isLoading);
  }

  openEditInventoryDialog(inventory: Inventory): void {
    this.inventoryService.openEditInventoryDialog(inventory, this.isLoading);
  }

  deleteInventory(inventory: Inventory): void {
    this.inventoryService.openDeleteInventoryDialog(inventory, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
