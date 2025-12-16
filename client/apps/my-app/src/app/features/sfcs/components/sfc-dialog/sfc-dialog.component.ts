import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SFC, CreateSFCRequest } from '../../models/sfc.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent } from '@ui/components';

export interface SFCDialogData {
  sfc?: SFC;
  isEdit: boolean;
}

@Component({
  selector: 'app-sfc-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    AxButtonComponent
  ],
  templateUrl: './sfc-dialog.component.html',
  styleUrls: ['./sfc-dialog.component.scss']
})
export class SFCDialogComponent implements OnInit {
  sfcForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SFCDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: SFCDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editSFC') : this.translate.instant('addSFC');
    
    this.sfcForm = this.fb.group({
      rmaId: [''],
      rmaNumber: [''],
      orderId: [''],
      orderNumber: [''],
      customerId: [''],
      customerName: [''],
      status: ['PENDING'],
      assignedTo: [''],
      notes: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.sfc) {
      this.populateForm(this.data.sfc);
    }
  }

  private populateForm(sfc: SFC): void {
    let jsonDataString = '{}';
    if (sfc.jsonData) {
      if (typeof sfc.jsonData === 'object') {
        jsonDataString = JSON.stringify(sfc.jsonData, null, 2);
      } else if (typeof sfc.jsonData === 'string') {
        try {
          JSON.parse(sfc.jsonData);
          jsonDataString = sfc.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.sfcForm.patchValue({
      rmaId: sfc.rmaId || '',
      rmaNumber: sfc.rmaNumber || '',
      orderId: sfc.orderId || '',
      orderNumber: sfc.orderNumber || '',
      customerId: sfc.customerId || '',
      customerName: sfc.customerName || '',
      status: sfc.status || 'PENDING',
      assignedTo: sfc.assignedTo || '',
      notes: sfc.notes || '',
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
    if (this.sfcForm.valid) {
      const formValue = this.sfcForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.sfc) {
        const sfcToUpdate: SFC = {
          ...this.data.sfc,
          rmaId: formValue.rmaId,
          rmaNumber: formValue.rmaNumber,
          orderId: formValue.orderId,
          orderNumber: formValue.orderNumber,
          customerId: formValue.customerId,
          customerName: formValue.customerName,
          status: formValue.status,
          assignedTo: formValue.assignedTo,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', sfc: sfcToUpdate });
      } else {
        const sfcToCreate: CreateSFCRequest = {
          rmaId: formValue.rmaId,
          rmaNumber: formValue.rmaNumber,
          orderId: formValue.orderId,
          orderNumber: formValue.orderNumber,
          customerId: formValue.customerId,
          customerName: formValue.customerName,
          status: formValue.status,
          assignedTo: formValue.assignedTo,
          notes: formValue.notes,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', sfc: sfcToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sfcForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.sfcForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

