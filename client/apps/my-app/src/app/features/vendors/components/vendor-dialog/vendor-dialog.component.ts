import {Component, Inject, OnInit, inject, signal} from '@angular/core';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Vendor, CreateVendorRequest} from '../../models/vendor.model';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../../../shared/services/language.service';
import {AxButtonComponent, AxIconComponent} from '@ui/components';
import {AddressService} from '../../../addresses/services/address.service';
import {Address} from '../../../addresses/models/address.model';
import {firstValueFrom} from 'rxjs';

export interface VendorDialogData
{
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
    MatSelectModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './vendor-dialog.component.html',
  styleUrls: ['./vendor-dialog.component.scss']
})
export class VendorDialogComponent implements OnInit
{
  vendorForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;
  addresses = signal<Address[]>([]);

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<VendorDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  private addressService = inject(AddressService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: VendorDialogData)
  {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editVendor') : this.translate.instant('addVendor');

    this.vendorForm = this.fb.group({
      vendorNumber: [''],
      companyName: [''],
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.email]],
      phone: [''],
      addressId: [''],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  async ngOnInit(): Promise<void>
  {
    await this.loadAddresses();
    if (this.isEdit && this.data.vendor)
    {
      this.populateForm(this.data.vendor);
    }
  }

  private async loadAddresses(): Promise<void>
  {
    try
    {
      const addresses = await firstValueFrom(this.addressService.getAddresses());
      this.addresses.set(addresses);
    }
    catch (error)
    {
      console.error('Failed to load addresses:', error);
    }
  }

  getAddressDisplay(address: Address): string
  {
    const parts: string[] = [];
    if (address.streetAddress1) parts.push(address.streetAddress1);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    const addressStr = parts.join(', ');
    const type = address.addressType ? ` (${this.translate.instant(address.addressType.toLowerCase())})` : '';
    return (addressStr || address.id || '') + type;
  }

  private populateForm(vendor: Vendor): void
  {
    let jsonDataString = '{}';
    if (vendor.jsonData)
    {
      if (typeof vendor.jsonData === 'object')
      {
        jsonDataString = JSON.stringify(vendor.jsonData, null, 2);
      }
      else if (typeof vendor.jsonData === 'string')
      {
        try
        {
          JSON.parse(vendor.jsonData);
          jsonDataString = vendor.jsonData;
        }
        catch
        {
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
      addressId: vendor.addressId || '',
      jsonData: jsonDataString
    });
  }

  private jsonValidator(control: any)
  {
    if (!control.value) return null;
    try
    {
      JSON.parse(control.value);
      return null;
    }
    catch (e)
    {
      return {invalidJson: true};
    }
  }

  get isEnglish(): boolean
  {
    return this.languageService.isEnglish();
  }

  onSubmit(): void
  {
    if (this.vendorForm.valid)
    {
      const formValue = this.vendorForm.value;

      let jsonData: any = {};
      if (formValue.jsonData && formValue.jsonData.trim() !== '{}')
      {
        try
        {
          jsonData = JSON.parse(formValue.jsonData);
        }
        catch (e)
        {
          return;
        }
      }

      if (this.isEdit && this.data.vendor)
      {
        const vendorToUpdate: Vendor =
            {
              id: this.data.vendor.id,
              vendorNumber: formValue.vendorNumber,
              companyName: formValue.companyName,
              firstName: formValue.firstName,
              lastName: formValue.lastName,
              email: formValue.email,
              phone: formValue.phone,
              addressId: formValue.addressId || undefined,
              jsonData: jsonData
            };
        this.dialogRef.close({action: 'update', vendor: vendorToUpdate});
      }
      else
      {
        const vendorToCreate: CreateVendorRequest =
            {
              vendorNumber: formValue.vendorNumber,
              companyName: formValue.companyName,
              firstName: formValue.firstName,
              lastName: formValue.lastName,
              email: formValue.email,
              phone: formValue.phone,
              addressId: formValue.addressId || undefined,
              jsonData: jsonData
            };
        this.dialogRef.close({action: 'create', vendor: vendorToCreate});
      }
    }
  }

  onCancel(): void
  {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.vendorForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string
  {
    const field = this.vendorForm.get(fieldName);
    if (field?.errors)
    {
      if (field.errors['email'])
      {
        return this.translate.instant('validation.email');
      }
      if (field.errors['invalidJson'])
      {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}
