import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RMA, CreateRMARequest } from '../../models/rma.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent, AxIconComponent } from '@ui/components';

export interface RMADialogData {
  rma?: RMA;
  isEdit: boolean;
}

@Component({
  selector: 'app-rma-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './rma-dialog.component.html',
  styleUrls: ['./rma-dialog.component.scss']
})
export class RMADialogComponent implements OnInit {
  rmaForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RMADialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: RMADialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editRMA') : this.translate.instant('addRMA');
    
    this.rmaForm = this.fb.group({
      orderId: [''],
      orderNumber: [''],
      customerId: [''],
      customerName: [''],
      rmaDate: [''],
      status: ['DRAFT'],
      notes: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.rma) {
      this.populateForm(this.data.rma);
    }
  }

  private populateForm(rma: RMA): void {
    let jsonDataString = '{}';
    if (rma.jsonData) {
      if (typeof rma.jsonData === 'object') {
        jsonDataString = JSON.stringify(rma.jsonData, null, 2);
      } else if (typeof rma.jsonData === 'string') {
        try {
          JSON.parse(rma.jsonData);
          jsonDataString = rma.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.rmaForm.patchValue({
      orderId: rma.orderId || '',
      orderNumber: rma.orderNumber || '',
      customerId: rma.customerId || '',
      customerName: rma.customerName || '',
      rmaDate: rma.rmaDate || '',
      status: rma.status || 'DRAFT',
      notes: rma.notes || '',
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
    if (this.rmaForm.valid) {
      const formValue = this.rmaForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.rma) {
        const rmaToUpdate: RMA = {
          ...this.data.rma,
          orderId: formValue.orderId,
          orderNumber: formValue.orderNumber,
          customerId: formValue.customerId,
          customerName: formValue.customerName,
          rmaDate: formValue.rmaDate,
          status: formValue.status,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', rma: rmaToUpdate });
      } else {
        const rmaToCreate: CreateRMARequest = {
          orderId: formValue.orderId,
          orderNumber: formValue.orderNumber,
          customerId: formValue.customerId,
          customerName: formValue.customerName,
          rmaDate: formValue.rmaDate,
          status: formValue.status,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', rma: rmaToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rmaForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.rmaForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

