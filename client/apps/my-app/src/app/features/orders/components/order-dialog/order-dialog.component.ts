import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Order, CreateOrderRequest, OrderItem } from '../../models/order.model';
import { Customer } from '../../../customers/models/customer.model';
import { Product } from '../../../products/models/product.model';
import { Address } from '../../../addresses/models/address.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { AxButtonComponent, AxIconComponent } from '@ui/components';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { ProductService } from '../../../products/services/product.service';
import { AddressService } from '../../../addresses/services/address.service';
import { firstValueFrom } from 'rxjs';

export interface OrderDialogData
{
  order?: Order;
  isEdit: boolean;
}

@Component({
  selector: 'app-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './order-dialog.component.html',
  styleUrls: ['./order-dialog.component.scss']
})
export class OrderDialogComponent implements OnInit
{
  orderForm: FormGroup;
  isEdit: boolean;
  dialogTitle: string;
  currentOrder = signal<Order | null>(null);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  addresses = signal<Address[]>([]);
  selectedProduct = signal<string | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(false);
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'lineTotal', 'actions'];

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<OrderDialogComponent>);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private addressService = inject(AddressService);
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: OrderDialogData)
  {
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

  async ngOnInit(): Promise<void> 
{
    await this.loadCustomers();
    await this.loadProducts();
    
    if (this.isEdit && this.data.order)
    {
      this.currentOrder.set(this.data.order);
      this.populateForm(this.data.order);
      if (this.data.order.customerId)
      {
        await this.loadAddresses(this.data.order.customerId);
      }
    }
 else
 {
      // Create a new order first
      await this.createNewOrder();
    }
  }

  private async createNewOrder(): Promise<void> 
{
    try 
{
      this.loading.set(true);
      const newOrder: Partial<Order> =
      {
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
      };
      const created = await firstValueFrom(this.orderService.createOrder(newOrder as CreateOrderRequest));
      if (created && created.id)
      {
        this.currentOrder.set(created);
      }
    }
 catch (err)
 {
      console.error('Error creating order:', err);
    }
 finally
 {
      this.loading.set(false);
    }
  }

  private async loadCustomers(): Promise<void> 
{
    try 
{
      const customers = await firstValueFrom(this.customerService.getCustomers());
      this.customers.set(customers);
    }
 catch (err)
 {
      console.error('Error loading customers:', err);
    }
  }

  private async loadProducts(): Promise<void> 
{
    try 
{
      const products = await firstValueFrom(this.productService.getProducts());
      // Filter to only active products
      const activeProducts = products.filter(p => p.active !== false);
      this.products.set(activeProducts);
    }
 catch (err)
 {
      console.error('Error loading products:', err);
    }
  }

  private async loadAddresses(customerId: string): Promise<void> 
{
    try 
{
      const addresses = await firstValueFrom(this.addressService.getAddressesByCustomerId(customerId));
      this.addresses.set(addresses);
    }
 catch (err)
 {
      console.error('Error loading addresses:', err);
    }
  }

  async onCustomerChange(customerId: string): Promise<void> 
{
    if (!customerId)
    {
      this.addresses.set([]);
      return;
    }
    
    const order = this.currentOrder();
    if (!order || !order.id)
    {
      return;
    }

    try 
{
      this.loading.set(true);
      // Update order with customer
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, { ...order, customerId })
      );
      if (updated)
      {
        this.currentOrder.set(updated);
        this.orderForm.patchValue({ customerId });
      }
      // Load addresses for the customer
      await this.loadAddresses(customerId);
    }
 catch (err)
 {
      console.error('Error updating customer:', err);
    }
 finally
 {
      this.loading.set(false);
    }
  }

  async onAddProduct(): Promise<void> 
{
    const productId = this.selectedProduct();
    const qty = this.quantity();
    const order = this.currentOrder();

    if (!productId || !order || !order.id)
    {
      return;
    }

    try 
{
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.addOrderItem(order.id, productId, qty)
      );
      if (updated)
      {
        this.currentOrder.set(updated);
        this.updateTotalsFromOrder(updated);
        this.selectedProduct.set(null);
        this.quantity.set(1);
      }
    }
 catch (err)
 {
      console.error('Error adding product:', err);
    }
 finally
 {
      this.loading.set(false);
    }
  }

  async onUpdateQuantity(itemId: string, quantity: number): Promise<void> 
{
    if (quantity < 1) return;
    
    const order = this.currentOrder();
    if (!order || !order.id)
    {
      return;
    }

    try 
{
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.updateOrderItemQuantity(order.id, itemId, quantity)
      );
      if (updated)
      {
        this.currentOrder.set(updated);
        this.updateTotalsFromOrder(updated);
      }
    }
 catch (err)
 {
      console.error('Error updating quantity:', err);
    }
 finally
 {
      this.loading.set(false);
    }
  }

  async onRemoveItem(itemId: string): Promise<void> 
{
    const order = this.currentOrder();
    if (!order || !order.id)
    {
      return;
    }

    try 
{
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.removeOrderItem(order.id, itemId)
      );
      if (updated)
      {
        this.currentOrder.set(updated);
        this.updateTotalsFromOrder(updated);
      }
    }
 catch (err)
 {
      console.error('Error removing item:', err);
    }
 finally
 {
      this.loading.set(false);
    }
  }

  private updateTotalsFromOrder(order: Order): void
 {
    this.orderForm.patchValue({
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      shippingCost: order.shippingCost || 0,
      total: order.total || 0
    }, { emitEvent: false });
  }

  private populateForm(order: Order): void
 {
    let jsonDataString = '{}';
    if (order.jsonData)
    {
      if (typeof order.jsonData === 'object')
      {
        jsonDataString = JSON.stringify(order.jsonData, null, 2);
      }
 else if (typeof order.jsonData === 'string')
 {
        try 
{
          JSON.parse(order.jsonData);
          jsonDataString = order.jsonData;
        }
 catch
 {
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
      return { invalidJson: true };
    }
  }

  async onSubmit(): Promise<void> 
{
    if (this.orderForm.valid)
    {
      const formValue = this.orderForm.value;
      const order = this.currentOrder();
      
      if (!order || !order.id)
      {
        console.error('No order available to submit');
        return;
      }

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

      // Update the existing order with form values
      const orderToUpdate: Order =
      {
        ...order,
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

      // For both new and edit, we update the existing order
      // The difference is handled by the service based on isEdit flag
      this.dialogRef.close({ action: this.isEdit ? 'update' : 'create', order: orderToUpdate });
    }
  }

  onCancel(): void
  {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean
  {
    const field = this.orderForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getErrorMessage(fieldName: string): string
  {
    const field = this.orderForm.get(fieldName);
    if (field?.errors)
    {
      if (field.errors['invalidJson'])
      {
        return this.translate.instant('validation.invalidJson');
      }
    }
    return '';
  }

  getProductName(productId?: string): string
  {
    if (!productId) return '';
    const product = this.products().find(p => p.id === productId);
    return product?.productName || product?.productCode || '';
  }

  getCustomerName(customerId?: string): string
  {
    if (!customerId) return '';
    const customer = this.customers().find(c => c.id === customerId);
    return customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || '';
  }

  getAddressLabel(addressId?: string): string
  {
    if (!addressId) return '';
    const address = this.addresses().find(a => a.id === addressId);
    if (!address) return '';
    return `${address.streetAddress1 || ''}, ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.trim();
  }
}
