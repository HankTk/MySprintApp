import { Injectable, inject, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Product, CreateProductRequest } from '../models/product.model';
import { ResourceService } from '../../../shared/services/resource.service';
import { TranslateService } from '@ngx-translate/core';
import { ProductDialogComponent, ProductDialogData } from '../components/product-dialog/product-dialog.component';
import { DeleteConfirmDialogComponent, DeleteConfirmDialogData } from '../../../shared/components/delete-confirm-dialog/delete-confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  private http = inject(HttpClient);
  private resourceManager: ResourceService = inject(ResourceService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loadProducts(isLoading: WritableSignal<boolean>): void {
    this.resourceManager.loadResource(
      'products',
      isLoading,
      this.translate.instant('messages.failedToLoad', { resource: 'products' })
    );
  }

  createProductWithNotification(
    productData: CreateProductRequest,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.createResource(
      'products',
      productData,
      isLoading,
      this.translate.instant('messages.productCreatedSuccessfully'),
      this.translate.instant('messages.failedToCreateProduct')
    );
  }

  updateProductWithNotification(
    productData: Product,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.updateResource(
      'products',
      productData.id!,
      productData,
      isLoading,
      this.translate.instant('messages.productUpdatedSuccessfully'),
      this.translate.instant('messages.failedToUpdateProduct')
    );
  }

  deleteProductWithNotification(
    id: string,
    isLoading: WritableSignal<boolean>
  ): void {
    this.resourceManager.deleteResource(
      'products',
      id,
      isLoading,
      this.translate.instant('messages.productDeletedSuccessfully'),
      this.translate.instant('messages.failedToDeleteProduct')
    );
  }

  openAddProductDialog(isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: { isEdit: false } as ProductDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'create') {
        this.createProductWithNotification(result.product, isLoading);
      }
    });
  }

  openEditProductDialog(product: Product, isLoading: WritableSignal<boolean>): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      data: { product, isEdit: true } as ProductDialogData,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'update') {
        this.updateProductWithNotification(result.product, isLoading);
      }
    });
  }

  openDeleteProductDialog(product: Product, isLoading: WritableSignal<boolean>): void {
    const productName = product.productName || product.productCode || 'Product';
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {
        userName: productName,
        userEmail: ''
      } as DeleteConfirmDialogData,
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteProductWithNotification(product.id!, isLoading);
      }
    });
  }
}
