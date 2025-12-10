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
import { Inventory } from '../../models/inventory.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-list',
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
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['productId', 'warehouseId', 'quantity', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private inventoryService = inject(InventoryService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  inventory = this.store.select('inventory');

  ngOnInit(): void {
    this.loadInventory();
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

