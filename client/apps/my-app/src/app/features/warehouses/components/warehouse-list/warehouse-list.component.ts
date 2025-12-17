import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { Warehouse } from '../../models/warehouse.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { WarehouseService } from '../../services/warehouse.service';

@Component({
  selector: 'app-warehouse-list',
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
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.scss']
})
export class WarehouseListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['warehouseCode', 'warehouseName', 'address', 'description', 'active', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private warehouseService = inject(WarehouseService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  warehouses = this.store.select('warehouses');

  ngOnInit(): void {
    this.loadWarehouses();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadWarehouses(): void {
    this.warehouseService.loadWarehouses(this.isLoading);
  }

  openAddWarehouseDialog(): void {
    this.warehouseService.openAddWarehouseDialog(this.isLoading);
  }

  openEditWarehouseDialog(warehouse: Warehouse): void {
    this.warehouseService.openEditWarehouseDialog(warehouse, this.isLoading);
  }

  deleteWarehouse(warehouse: Warehouse): void {
    this.warehouseService.openDeleteWarehouseDialog(warehouse, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

