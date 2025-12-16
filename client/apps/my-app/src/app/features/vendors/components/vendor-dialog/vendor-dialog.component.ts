import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Vendor, CreateVendorRequest } from '../../models/vendor.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent } from '@ui/components';

export interface VendorDialogData {
  vendor?: Vendor;
  isEdit: boolean;
}

@Component({
  selector: 'app-vendor-dialog',
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
  templateUrl: './vendor-dialog.component.html',
  styleUrls: ['./vendor-dialog.component.scss']
})
export class VendorDialogComponent implements OnInit {
  vendorForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<VendorDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: VendorDialogData) {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editVendor') : this.translate.instant('addVendor');
    
    this.vendorForm = this.fb.group({
      vendorNumber: [''],
      companyName: [''],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.vendor) {
      this.populateForm(this.data.vendor);
    }
  }

  private populateForm(vendor: Vendor): void {
    let jsonDataString = '{}';
    if (vendor.jsonData) {
      if (typeof vendor.jsonData === 'object') {
        jsonDataString = JSON.stringify(vendor.jsonData, null, 2);
      } else if (typeof vendor.jsonData === 'string') {
        try {
          JSON.parse(vendor.jsonData);
          jsonDataString = vendor.jsonData;
        } catch {
          jsonDataString = '{}';
        }
      }
    }

    this.vendorForm.patchValue({
      vendorNumber: vendor.vendorNumber || '',
      companyName: vendor.companyName || '',
      firstName: vendor.firstName || '',
      lastName: vendor.lastName || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
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
    if (this.vendorForm.valid) {
      const formValue = this.vendorForm.value;
      
      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}') {
        try {
          jsonData = JSON.parse(formValue.jsonData);
        } catch (e) {
          return;
        }
      }

      if (this.isEdit && this.data.vendor) {
        const vendorToUpdate: Vendor = {
          id: this.data.vendor.id,
          vendorNumber: formValue.vendorNumber,
          companyName: formValue.companyName,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'update', vendor: vendorToUpdate });
      } else {
        const vendorToCreate: CreateVendorRequest = {
          vendorNumber: formValue.vendorNumber,
          companyName: formValue.companyName,
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          jsonData: jsonData
        };
        this.dialogRef.close({ action: 'create', vendor: vendorToCreate });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vendorForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.vendorForm.get(fieldName);
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
