import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Address, CreateAddressRequest } from '../../models/address.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent, AxIconComponent } from '@ui/components';

export interface AddressDialogData {
  address?: Address;
  isEdit: boolean;
}

@Component({
  selector: 'app-address-dialog',
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
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.scss']
})
export class AddressDialogComponent implements OnInit {
  addressForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;
  addressTypes = ['SHIPPING', 'BILLING'];

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddressDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: AddressDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editAddress') : this.translate.instant('addAddress');
    
    this.addressForm = this.fb.group({
      customerId: [''],
      addressType: [''],
      streetAddress1: [''],
      streetAddress2: [''],
      city: [''],
      state: [''],
      postalCode: [''],
      country: [''],
      contactName: [''],
      contactPhone: [''],
      defaultAddress: [false],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.address) {
      this.populateForm(this.data.address);
    }
  }

  private populateForm(address: Address): void {
    let jsonDataString = '{}';
    if (address.jsonData) {
      if (typeof address.jsonData === 'object') {
        jsonDataString = JSON.stringify(address.jsonData, null, 2);
      } else if (typeof address.jsonData === 'string') {
        try {
          JSON.parse(address.jsonData);
          jsonDataString = address.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.addressForm.patchValue({
      customerId: address.customerId || '',
      addressType: address.addressType || '',
      streetAddress1: address.streetAddress1 || '',
      streetAddress2: address.streetAddress2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      contactName: address.contactName || '',
      contactPhone: address.contactPhone || '',
      defaultAddress: address.defaultAddress || false,
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
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.address) {
        const addressToUpdate: Address = {
          id: this.data.address.id,
          customerId: formValue.customerId,
          addressType: formValue.addressType,
          streetAddress1: formValue.streetAddress1,
          streetAddress2: formValue.streetAddress2,
          city: formValue.city,
          state: formValue.state,
          postalCode: formValue.postalCode,
          country: formValue.country,
          contactName: formValue.contactName,
          contactPhone: formValue.contactPhone,
          defaultAddress: formValue.defaultAddress,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', address: addressToUpdate });
      } else {
        const addressToCreate: CreateAddressRequest = {
          customerId: formValue.customerId,
          addressType: formValue.addressType,
          streetAddress1: formValue.streetAddress1,
          streetAddress2: formValue.streetAddress2,
          city: formValue.city,
          state: formValue.state,
          postalCode: formValue.postalCode,
          country: formValue.country,
          contactName: formValue.contactName,
          contactPhone: formValue.contactPhone,
          defaultAddress: formValue.defaultAddress,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', address: addressToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.addressForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['invalidJson']) {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

