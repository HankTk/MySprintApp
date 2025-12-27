import {Component, Inject, OnInit, inject} from '@angular/core';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {Product, CreateProductRequest} from '../../models/product.model';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../../../shared/services/language.service';
import {AxButtonComponent, AxIconComponent} from '@ui/components';

export interface ProductDialogData
{
  product?: Product;
  isEdit: boolean;
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './product-dialog.component.html',
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent implements OnInit
{
  productForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductDialogData)
  {
    this.isEdit = data.isEdit;
    this.dialogTitle = this.isEdit ? this.translate.instant('editProduct') : this.translate.instant('addProduct');

    this.productForm = this.fb.group({
      productCode: [''],
      productName: [''],
      description: [''],
      unitPrice: [0, [Validators.min(0)]],
      cost: [0, [Validators.min(0)]],
      unitOfMeasure: [''],
      active: [true],
      jsonData: ['{}', [this.jsonValidator]]
    });
  }

  ngOnInit(): void
  {
    if (this.isEdit && this.data.product)
    {
      this.populateForm(this.data.product);
    }
  }

  private populateForm(product: Product): void
  {
    let jsonDataString = '{}';
    if (product.jsonData)
    {
      if (typeof product.jsonData === 'object')
      {
        jsonDataString = JSON.stringify(product.jsonData, null, 2);
      }
      else if (typeof product.jsonData === 'string')
      {
        try
        {
          JSON.parse(product.jsonData);
          jsonDataString = product.jsonData;
        }
        catch
        {
          jsonDataString = '{}';
        }
      }
    }

    this.productForm.patchValue({
      productCode: product.productCode || '',
      productName: product.productName || '',
      description: product.description || '',
      unitPrice: product.unitPrice || 0,
      cost: product.cost || 0,
      unitOfMeasure: product.unitOfMeasure || '',
      active: product.active !== undefined ? product.active : true,
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

  onSubmit(): void
  {
    if (this.productForm.valid)
    {
      const formValue = this.productForm.value;

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

      if (this.isEdit && this.data.product)
      {
        const productToUpdate: Product =
            {
              id: this.data.product.id,
              productCode: formValue.productCode,
              productName: formValue.productName,
              description: formValue.description,
              unitPrice: formValue.unitPrice,
              cost: formValue.cost,
              unitOfMeasure: formValue.unitOfMeasure,
              active: formValue.active,
              jsonData: jsonData
            };
        this.dialogRef.close({action: 'update', product: productToUpdate});
      }
      else
      {
        const productToCreate: CreateProductRequest =
            {
              productCode: formValue.productCode,
              productName: formValue.productName,
              description: formValue.description,
              unitPrice: formValue.unitPrice,
              cost: formValue.cost,
              unitOfMeasure: formValue.unitOfMeasure,
              active: formValue.active,
              jsonData: jsonData
            };
        this.dialogRef.close({action: 'create', product: productToCreate});
      }
    }
  }

  onCancel(): void
  {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string
  {
    const field = this.productForm.get(fieldName);
    if (field?.errors)
    {
      if (field.errors['min'])
      {
        return this.translate.instant('validation.min', {min: field.errors['min'].min});
      }
      if (field.errors['invalidJson'])
      {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }
}

