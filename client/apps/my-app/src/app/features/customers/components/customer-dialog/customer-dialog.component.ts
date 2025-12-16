import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Customer, CreateCustomerRequest } from '../../models/customer.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent } from '@ui/components';

export interface CustomerDialogData {
  customer?: Customer;
  isEdit: boolean;
}

@Component({
  selector: 'app-customer-dialog',
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
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.scss']
})
export class CustomerDialogComponent implements OnInit {
  customerForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CustomerDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: CustomerDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editCustomer') : this.translate.instant('addCustomer');
    
    this.customerForm = this.fb.group({
      customerNumber: [''],
      companyName: [''],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.customer) {
      this.populateForm(this.data.customer);
    }
  }

  private populateForm(customer: Customer): void {
    let jsonDataString = '{}';
    if (customer.jsonData) {
      if (typeof customer.jsonData === 'object') {
        jsonDataString = JSON.stringify(customer.jsonData, null, 2);
      } else if (typeof customer.jsonData === 'string') {
        try {
          JSON.parse(customer.jsonData);
          jsonDataString = customer.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.customerForm.patchValue({
      customerNumber: customer.customerNumber || '',
      companyName: customer.companyName || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
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

  get isEnglish(): boolean {
    return this.languageService.isEnglish();
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      const formValue = this.customerForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.customer) {
        const customerToUpdate: Customer = {
          id: this.data.customer.id,
          customerNumber: formValue.customerNumber,
          companyName: formValue.companyName,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', customer: customerToUpdate });
      } else {
        const customerToCreate: CreateCustomerRequest = {
          customerNumber: formValue.customerNumber,
          companyName: formValue.companyName,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', customer: customerToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['email']) {
        return this.translate.instant('validation.email');
      }
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

