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

