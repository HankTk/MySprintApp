import {Component, Inject, OnInit, inject, signal} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {Warehouse, CreateWarehouseRequest} from '../../models/warehouse.model';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../../../shared/services/language.service';
import {AxButtonComponent, AxIconComponent} from '@ui/components';
import {AddressService} from '../../../addresses/services/address.service';
import {Address} from '../../../addresses/models/address.model';
import {firstValueFrom} from 'rxjs';

export interface WarehouseDialogData
{
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
    TranslateModule,
    AxButtonComponent,
    AxIconComponent,
  ],
  templateUrl: './warehouse-dialog.component.html',
  styleUrls: ['./warehouse-dialog.component.scss'],
})
export class WarehouseDialogComponent implements OnInit
{
  warehouseForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;
  addresses = signal<Address[]>([]);

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WarehouseDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  private addressService = inject(AddressService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: WarehouseDialogData)
  {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit
        ? this.translate.instant('editWarehouse')
        : this.translate.instant('addWarehouse');

    this.warehouseForm = this.fb.group({
      warehouseCode: [''],
      warehouseName: [''],
      addressId: [''],
      description: [''],
      active: [true],
      jsonData: ['{}', [this.jsonValidator]],
    });
  }

  async ngOnInit(): Promise<void>
  {
    await this.loadAddresses();
    if (this.isEdit && this.data.warehouse)
    {
      this.populateForm(this.data.warehouse);
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
    const type = address.addressType
        ? ` (${this.translate.instant(address.addressType.toLowerCase())})`
        : '';
    return (addressStr || address.id || '') + type;
  }

  private populateForm(warehouse: Warehouse): void
  {
    let jsonDataString = '{}';
    if (warehouse.jsonData)
    {
      if (typeof warehouse.jsonData === 'object')
      {
        jsonDataString = JSON.stringify(warehouse.jsonData, null, 2);
      }
      else if (typeof warehouse.jsonData === 'string')
      {
        try
        {
          JSON.parse(warehouse.jsonData);
          jsonDataString = warehouse.jsonData;
        }
        catch
        {
          jsonDataString = '{}';
        }
      }
    }

    this.warehouseForm.patchValue({
      warehouseCode: warehouse.warehouseCode || '',
      warehouseName: warehouse.warehouseName || '',
      addressId: warehouse.addressId || '',
      description: warehouse.description || '',
      active: warehouse.active !== undefined ? warehouse.active : true,
      jsonData: jsonDataString,
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

  onSubmit(): void
  {
    if (this.warehouseForm.valid)
    {
      const formValue = this.warehouseForm.value;

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

      if (this.isEdit && this.data.warehouse)
      {
        const warehouseToUpdate: Warehouse = {
          id: this.data.warehouse.id,
          warehouseCode: formValue.warehouseCode,
          warehouseName: formValue.warehouseName,
          addressId: formValue.addressId || undefined,
          description: formValue.description,
          active: formValue.active,
          jsonData: jsonData,
        };
        this.dialogRef.close({action: 'update', warehouse: warehouseToUpdate});
      }
      else
      {
        const warehouseToCreate: CreateWarehouseRequest = {
          warehouseCode: formValue.warehouseCode,
          warehouseName: formValue.warehouseName,
          addressId: formValue.addressId || undefined,
          description: formValue.description,
          active: formValue.active,
          jsonData: jsonData,
        };
        this.dialogRef.close({action: 'create', warehouse: warehouseToCreate});
      }
    }
  }

  onCancel(): void
  {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.warehouseForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string
  {
    const field = this.warehouseForm.get(fieldName);
    if (field?.errors)
    {
      if (field.errors['invalidJson'])
      {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}
