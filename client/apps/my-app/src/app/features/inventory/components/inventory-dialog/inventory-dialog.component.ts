import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Inventory, CreateInventoryRequest } from '../../models/inventory.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';

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
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './inventory-dialog.component.html',
  styleUrls: ['./inventory-dialog.component.scss']
})
export class InventoryDialogComponent implements OnInit {
  inventoryForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InventoryDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
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

  ngOnInit(): void {
    if (this.isEdit && this.data.inventory) {
      this.populateForm(this.data.inventory);
    }
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

