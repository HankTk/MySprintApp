import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Inventory, CreateInventoryRequest } from '../../models/inventory.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent, AxIconComponent } from '@ui/components';
import { ProductService } from '../../../products/services/product.service';
import { WarehouseService } from '../../../warehouses/services/warehouse.service';
import { Product } from '../../../products/models/product.model';
import { Warehouse } from '../../../warehouses/models/warehouse.model';
import { firstValueFrom } from 'rxjs';

export interface InventoryDialogData {
  inventory?: Inventory;
  isEdit: boolean;
}

@Component({
  selector: 'app-inventory-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './inventory-dialog.component.html',
  styleUrls: ['./inventory-dialog.component.scss']
})
export class InventoryDialogComponent implements OnInit {
  inventoryForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;
  products = signal<Product[]>([]);
  warehouses = signal<Warehouse[]>([]);

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InventoryDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  private productService = inject(ProductService);
  private warehouseService = inject(WarehouseService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: InventoryDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editInventory') : this.translate.instant('addInventory');
    
    this.inventoryForm = this.fb.group({
      productId: ['', [Validators.required]],
      warehouseId: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.loadProducts(),
      this.loadWarehouses()
    ]);
    if (this.isEdit && this.data.inventory) {
      this.populateForm(this.data.inventory);
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await firstValueFrom(this.productService.getProducts());
      // Filter to show only active products
      const activeProducts = products.filter(p => p.active !== false);
      this.products.set(activeProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  private async loadWarehouses(): Promise<void> {
    try {
      const warehouses = await firstValueFrom(this.warehouseService.getWarehouses());
      // Filter to show only active warehouses
      const activeWarehouses = warehouses.filter(w => w.active !== false);
      this.warehouses.set(activeWarehouses);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  }

  getProductDisplay(product: Product): string {
    if (product.productName && product.productCode) {
      return `${product.productCode} - ${product.productName}`;
    }
    return product.productName || product.productCode || product.id || '';
  }

  getWarehouseDisplay(warehouse: Warehouse): string {
    if (warehouse.warehouseName && warehouse.warehouseCode) {
      return `${warehouse.warehouseCode} - ${warehouse.warehouseName}`;
    }
    return warehouse.warehouseName || warehouse.warehouseCode || warehouse.id || '';
  }

  private populateForm(inventory: Inventory): void {
    let jsonDataString = '{}';
    if (inventory.jsonData) {
      if (typeof inventory.jsonData === 'object') {
        jsonDataString = JSON.stringify(inventory.jsonData, null, 2);
      } else if (typeof inventory.jsonData === 'string') {
        try {
          JSON.parse(inventory.jsonData);
          jsonDataString = inventory.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.inventoryForm.patchValue({
      productId: inventory.productId || '',
      warehouseId: inventory.warehouseId || '',
      quantity: inventory.quantity || 0,
      jsonData: jsonDataString
    });
  }

  private jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  onSubmit(): void {
    if (this.inventoryForm.valid) {
      const formValue = this.inventoryForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.inventory) {
        const inventoryToUpdate: Inventory = {
          id: this.data.inventory.id,
          productId: formValue.productId,
          warehouseId: formValue.warehouseId,
          quantity: formValue.quantity,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', inventory: inventoryToUpdate });
      } else {
        const inventoryToCreate: CreateInventoryRequest = {
          productId: formValue.productId,
          warehouseId: formValue.warehouseId,
          quantity: formValue.quantity,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', inventory: inventoryToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.inventoryForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.inventoryForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.translate.instant('validation.required');
      }
      if (field.errors['min']) {
        return this.translate.instant('validation.min', { min: field.errors['min'].min });
      }
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}
