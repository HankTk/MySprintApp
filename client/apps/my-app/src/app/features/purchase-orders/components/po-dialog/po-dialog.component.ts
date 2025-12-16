import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PurchaseOrder, CreatePurchaseOrderRequest } from '../../models/purchase-order.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent } from '@ui/components';

export interface PurchaseOrderDialogData {
  purchaseOrder?: PurchaseOrder;
  isEdit: boolean;
}

@Component({
  selector: 'app-purchase-order-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    AxButtonComponent
  ],
  templateUrl: './po-dialog.component.html',
  styleUrls: ['./po-dialog.component.scss']
})
export class PurchaseOrderDialogComponent implements OnInit {
  poForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PurchaseOrderDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: PurchaseOrderDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editPurchaseOrder') : this.translate.instant('addPurchaseOrder');
    
    this.poForm = this.fb.group({
      supplierId: [''],
      shippingAddressId: [''],
      billingAddressId: [''],
      orderDate: [''],
      expectedDeliveryDate: [''],
      status: ['DRAFT'],
      notes: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.purchaseOrder) {
      this.populateForm(this.data.purchaseOrder);
    }
  }

  private populateForm(po: PurchaseOrder): void {
    let jsonDataString = '{}';
    if (po.jsonData) {
      if (typeof po.jsonData === 'object') {
        jsonDataString = JSON.stringify(po.jsonData, null, 2);
      } else if (typeof po.jsonData === 'string') {
        try {
          JSON.parse(po.jsonData);
          jsonDataString = po.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.poForm.patchValue({
      supplierId: po.supplierId || '',
      shippingAddressId: po.shippingAddressId || '',
      billingAddressId: po.billingAddressId || '',
      orderDate: po.orderDate || '',
      expectedDeliveryDate: po.expectedDeliveryDate || '',
      status: po.status || 'DRAFT',
      notes: po.notes || '',
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
    if (this.poForm.valid) {
      const formValue = this.poForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.purchaseOrder) {
        const poToUpdate: PurchaseOrder = {
          ...this.data.purchaseOrder,
          supplierId: formValue.supplierId,
          shippingAddressId: formValue.shippingAddressId,
          billingAddressId: formValue.billingAddressId,
          orderDate: formValue.orderDate,
          expectedDeliveryDate: formValue.expectedDeliveryDate,
          status: formValue.status,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', purchaseOrder: poToUpdate });
      } else {
        const poToCreate: CreatePurchaseOrderRequest = {
          supplierId: formValue.supplierId,
          shippingAddressId: formValue.shippingAddressId,
          billingAddressId: formValue.billingAddressId,
          orderDate: formValue.orderDate,
          expectedDeliveryDate: formValue.expectedDeliveryDate,
          status: formValue.status,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', purchaseOrder: poToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.poForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.poForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

