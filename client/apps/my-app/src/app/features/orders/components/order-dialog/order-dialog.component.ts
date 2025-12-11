import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Order, CreateOrderRequest } from '../../models/order.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';

export interface OrderDialogData {
  order?: Order;
  isEdit: boolean;
}

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    TranslateModule
  ],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit {
  orderForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<OrderDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: OrderDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editOrder') : this.translate.instant('addOrder');
    
    this.orderForm = this.fb.group({
      customerId: [''],
      shippingAddressId: [''],
      billingAddressId: [''],
      orderDate: [''],
      shipDate: [''],
      status: ['DRAFT'],
      invoiceNumber: [''],
      invoiceDate: [''],
      subtotal: [0],
      tax: [0],
      shippingCost: [0],
      total: [0],
      notes: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.order) {
      this.populateForm(this.data.order);
    }
  }

  private populateForm(order: Order): void {
    let jsonDataString = '{}';
    if (order.jsonData) {
      if (typeof order.jsonData === 'object') {
        jsonDataString = JSON.stringify(order.jsonData, null, 2);
      } else if (typeof order.jsonData === 'string') {
        try {
          JSON.parse(order.jsonData);
          jsonDataString = order.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.orderForm.patchValue({
      customerId: order.customerId || '',
      shippingAddressId: order.shippingAddressId || '',
      billingAddressId: order.billingAddressId || '',
      orderDate: order.orderDate || '',
      shipDate: order.shipDate || '',
      status: order.status || 'DRAFT',
      invoiceNumber: order.invoiceNumber || '',
      invoiceDate: order.invoiceDate || '',
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shippingCost: order.shippingCost || 0,
      total: order.total || 0,
      notes: order.notes || '',
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
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.order) {
        const orderToUpdate: Order = {
          ...this.data.order,
          customerId: formValue.customerId,
          shippingAddressId: formValue.shippingAddressId,
          billingAddressId: formValue.billingAddressId,
          orderDate: formValue.orderDate,
          shipDate: formValue.shipDate,
          status: formValue.status,
          invoiceNumber: formValue.invoiceNumber,
          invoiceDate: formValue.invoiceDate,
          subtotal: formValue.subtotal,
          tax: formValue.tax,
          shippingCost: formValue.shippingCost,
          total: formValue.total,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', order: orderToUpdate });
      } else {
        const orderToCreate: CreateOrderRequest = {
          customerId: formValue.customerId,
          shippingAddressId: formValue.shippingAddressId,
          billingAddressId: formValue.billingAddressId,
          orderDate: formValue.orderDate,
          shipDate: formValue.shipDate,
          status: formValue.status,
          items: [],
          subtotal: formValue.subtotal,
          tax: formValue.tax,
          shippingCost: formValue.shippingCost,
          total: formValue.total,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', order: orderToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

