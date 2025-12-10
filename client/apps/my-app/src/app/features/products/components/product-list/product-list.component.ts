import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { Product } from '../../models/product.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
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
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['productCode', 'productName', 'description', 'unitPrice', 'cost', 'unitOfMeasure', 'active', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private productService = inject(ProductService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  products = this.store.select('products');

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadProducts(): void {
    this.productService.loadProducts(this.isLoading);
  }

  openAddProductDialog(): void {
    this.productService.openAddProductDialog(this.isLoading);
  }

  openEditProductDialog(product: Product): void {
    this.productService.openEditProductDialog(product, this.isLoading);
  }

  deleteProduct(product: Product): void {
    this.productService.openDeleteProductDialog(product, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
