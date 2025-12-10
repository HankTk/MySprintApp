import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Warehouse, CreateWarehouseRequest } from '../../models/warehouse.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';

export interface WarehouseDialogData {
  warehouse?: Warehouse;
  isEdit: boolean;
}

@Component({
  selector: 'app-warehouse-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './warehouse-dialog.component.html',
  styleUrls: ['./warehouse-dialog.component.scss']
})
export class WarehouseDialogComponent implements OnInit {
  warehouseForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WarehouseDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: WarehouseDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editWarehouse') : this.translate.instant('addWarehouse');
    
    this.warehouseForm = this.fb.group({
      warehouseCode: [''],
      warehouseName: [''],
      address: [''],
      description: [''],
      active: [true],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.warehouse) {
      this.populateForm(this.data.warehouse);
    }
  }

  private populateForm(warehouse: Warehouse): void {
    let jsonDataString = '{}';
    if (warehouse.jsonData) {
      if (typeof warehouse.jsonData === 'object') {
        jsonDataString = JSON.stringify(warehouse.jsonData, null, 2);
      } else if (typeof warehouse.jsonData === 'string') {
        try {
          JSON.parse(warehouse.jsonData);
          jsonDataString = warehouse.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.warehouseForm.patchValue({
      warehouseCode: warehouse.warehouseCode || '',
      warehouseName: warehouse.warehouseName || '',
      address: warehouse.address || '',
      description: warehouse.description || '',
      active: warehouse.active !== undefined ? warehouse.active : true,
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
    if (this.warehouseForm.valid) {
      const formValue = this.warehouseForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.warehouse) {
        const warehouseToUpdate: Warehouse = {
          id: this.data.warehouse.id,
          warehouseCode: formValue.warehouseCode,
          warehouseName: formValue.warehouseName,
          address: formValue.address,
          description: formValue.description,
          active: formValue.active,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', warehouse: warehouseToUpdate });
      } else {
        const warehouseToCreate: CreateWarehouseRequest = {
          warehouseCode: formValue.warehouseCode,
          warehouseName: formValue.warehouseName,
          address: formValue.address,
          description: formValue.description,
          active: formValue.active,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', warehouse: warehouseToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.warehouseForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.warehouseForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

