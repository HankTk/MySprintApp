import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { AxButtonComponent, AxProgressComponent } from '@ui/components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Order, CreateOrderRequest } from '../../models/order.model';
import { Customer } from '../../../customers/models/customer.model';
import { Product } from '../../../products/models/product.model';
import { Address } from '../../../addresses/models/address.model';
import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { ProductService } from '../../../products/services/product.service';
import { AddressService } from '../../../addresses/services/address.service';
import { OrderStep, EntrySubStep } from './types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-order-entry',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    AxButtonComponent,
    AxProgressComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
  ],
  templateUrl: './order-entry.component.html',
  styleUrls: ['./order-entry.component.scss']
})
export class OrderEntryComponent implements OnInit {
  currentStep = signal<OrderStep>('entry');
  currentEntrySubStep = signal<EntrySubStep>('customer');
  order = signal<Order | null>(null);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  addresses = signal<Address[]>([]);
  selectedProduct = signal<string | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'lineTotal', 'actions'];

  // Approval state
  approvalNotes = signal<string>('');
  creditCheckPassed = signal<boolean>(false);
  inventoryConfirmed = signal<boolean>(false);
  priceApproved = signal<boolean>(false);

  // Shipping instruction state
  shippingInstructions = signal<string>('');
  requestedShipDate = signal<Date | null>(null);

  // Shipping state
  actualShipDate = signal<Date | null>(null);
  trackingNumber = signal<string>('');

  // Invoicing state
  invoiceNumber = signal<string>('');
  invoiceDate = signal<Date | null>(null);

  // History state
  historyNote = signal<string>('');
  
  // Computed signal for order history
  orderHistory = computed(() => {
    const order = this.order();
    if (!order?.jsonData?.history) return [];
    // Handle both object and string jsonData
    let history = order.jsonData.history;
    if (typeof history === 'string') {
      try {
        const parsed = JSON.parse(history);
        history = parsed.history || parsed;
      } catch {
        return [];
      }
    }
    return Array.isArray(history) ? history : [];
  });

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private addressService = inject(AddressService);
  private translate = inject(TranslateService);

  steps: { key: OrderStep; label: string }[] = [
    { key: 'entry', label: 'orderEntry.step.entry' },
    { key: 'approval', label: 'orderEntry.step.approval' },
    { key: 'confirmation', label: 'orderEntry.step.confirmation' },
    { key: 'shipping_instruction', label: 'orderEntry.step.shippingInstruction' },
    { key: 'shipping', label: 'orderEntry.step.shipping' },
    { key: 'invoicing', label: 'orderEntry.step.invoicing' },
    { key: 'history', label: 'orderEntry.step.history' }
  ];

  entrySubSteps: { key: EntrySubStep; label: string }[] = [
    { key: 'customer', label: 'orderEntry.subStep.customer' },
    { key: 'products', label: 'orderEntry.subStep.products' },
    { key: 'shipping', label: 'orderEntry.subStep.shipping' },
    { key: 'review', label: 'orderEntry.subStep.review' }
  ];

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('id');
    
    await this.loadCustomers();
    await this.loadProducts();

    if (orderId) {
      await this.loadOrder(orderId);
    } else {
      await this.createNewOrder();
    }
  }

  private async createNewOrder(): Promise<void> {
    try {
      this.loading.set(true);
      const newOrder: Partial<Order> = {
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
      };
      const created = await firstValueFrom(this.orderService.createOrder(newOrder as CreateOrderRequest));
      if (created && created.id) {
        this.order.set(created);
      }
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadOrder(id: string): Promise<void> {
    try {
      this.loading.set(true);
      const order = await firstValueFrom(this.orderService.getOrder(id));
      if (order) {
        this.order.set(order);
        if (order.customerId) {
          await this.loadAddresses(order.customerId);
        }
        // Set step based on order status
        this.setStepFromStatus(order.status);
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      this.loading.set(false);
    }
  }

  private setStepFromStatus(status?: string): void {
    const order = this.order();
    
    switch (status) {
      case 'DRAFT':
        this.currentStep.set('entry');
        if (order?.customerId) {
          if (order.items && order.items.length > 0) {
            if (order.shippingAddressId && order.billingAddressId) {
              this.currentEntrySubStep.set('review');
            } else {
              this.currentEntrySubStep.set('shipping');
            }
          } else {
            this.currentEntrySubStep.set('products');
          }
        } else {
          this.currentEntrySubStep.set('customer');
        }
        break;
      case 'PENDING_APPROVAL':
        this.currentStep.set('approval');
        // Load approval data from jsonData
        if (order?.jsonData) {
          this.approvalNotes.set(order.jsonData.approvalNotes || '');
          this.creditCheckPassed.set(order.jsonData.creditCheckPassed || false);
          this.inventoryConfirmed.set(order.jsonData.inventoryConfirmed || false);
          this.priceApproved.set(order.jsonData.priceApproved || false);
        }
        break;
      case 'APPROVED':
        this.currentStep.set('confirmation');
        break;
      case 'SHIPPING_INSTRUCTED':
        this.currentStep.set('shipping');
        // Load shipping instruction data
        if (order?.jsonData) {
          this.shippingInstructions.set(order.jsonData.shippingInstructions || '');
          const dateStr = order.jsonData.requestedShipDate;
          this.requestedShipDate.set(dateStr ? new Date(dateStr) : null);
        }
        break;
      case 'SHIPPED':
        this.currentStep.set('invoicing');
        // Load shipping data
        if (order?.jsonData) {
          this.actualShipDate.set(order.shipDate ? new Date(order.shipDate) : null);
          this.trackingNumber.set(order.jsonData.trackingNumber || '');
        }
        break;
      case 'INVOICED':
      case 'PAID':
        this.currentStep.set('history');
        // Load invoicing data
        if (order) {
          this.invoiceNumber.set(order.invoiceNumber || order.jsonData?.invoiceNumber || '');
          if (order.invoiceDate) {
            this.invoiceDate.set(new Date(order.invoiceDate));
          } else if (order.jsonData?.invoiceDate) {
            const dateStr = order.jsonData.invoiceDate;
            this.invoiceDate.set(dateStr ? new Date(dateStr) : null);
          }
        }
        break;
      default:
        this.currentStep.set('entry');
        this.currentEntrySubStep.set('customer');
    }
  }

  private async loadCustomers(): Promise<void> {
    try {
      const customers = await firstValueFrom(this.customerService.getCustomers());
      this.customers.set(customers);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const products = await firstValueFrom(this.productService.getProducts());
      const activeProducts = products.filter(p => p.active !== false);
      this.products.set(activeProducts);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  private async loadAddresses(customerId: string): Promise<void> {
    try {
      const addresses = await firstValueFrom(this.addressService.getAddressesByCustomerId(customerId));
      this.addresses.set(addresses);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  }

  async onCustomerChange(customerId: string | null): Promise<void> {
    // Normalize empty string to null/undefined
    const normalizedCustomerId = customerId && customerId.trim() !== '' ? customerId : undefined;
    
    if (!normalizedCustomerId) {
      this.addresses.set([]);
      // Clear customerId from order if customer is deselected
      const order = this.order();
      if (order && order.id) {
        try {
          this.loading.set(true);
          const updated = await firstValueFrom(
            this.orderService.updateOrder(order.id, { ...order, customerId: undefined })
          );
          if (updated) {
            this.order.set(updated);
          }
        } catch (err) {
          console.error('Error clearing customer:', err);
        } finally {
          this.loading.set(false);
        }
      }
      return;
    }
    
    // Wait for order to be created if it doesn't exist yet
    let order = this.order();
    if (!order || !order.id) {
      // Wait a bit for order creation to complete
      let retries = 0;
      while ((!order || !order.id) && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        order = this.order();
        retries++;
      }
      
      if (!order || !order.id) {
        console.error('Order not available. Cannot update customer.');
        alert('Order is not ready yet. Please wait a moment and try again.');
        return;
      }
    }

    try {
      this.loading.set(true);
      console.log('Updating order customer:', order.id, 'to customer:', normalizedCustomerId);
      const orderToUpdate = { ...order, customerId: normalizedCustomerId };
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, orderToUpdate)
      );
      if (updated) {
        console.log('Customer updated successfully. Updated order:', updated);
        this.order.set(updated);
        await this.loadAddresses(normalizedCustomerId);
      } else {
        console.error('Order update returned null or undefined');
        alert('Failed to update customer. Please try again.');
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to update customer: ${errorMessage}. Please try again.`);
    } finally {
      this.loading.set(false);
    }
  }

  async onAddProduct(): Promise<void> {
    const productId = this.selectedProduct();
    const qty = this.quantity();
    const order = this.order();

    if (!productId || !order || !order.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.addOrderItem(order.id, productId, qty)
      );
      if (updated) {
        this.order.set(updated);
        this.selectedProduct.set(null);
        this.quantity.set(1);
      }
    } catch (err) {
      console.error('Error adding product:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onUpdateQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity < 1) return;
    
    const order = this.order();
    if (!order || !order.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.updateOrderItemQuantity(order.id, itemId, quantity)
      );
      if (updated) {
        this.order.set(updated);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRemoveItem(itemId: string): Promise<void> {
    const order = this.order();
    if (!order || !order.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.removeOrderItem(order.id, itemId)
      );
      if (updated) {
        this.order.set(updated);
      }
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onShippingInfoChange(shippingAddressId: string, billingAddressId: string): Promise<void> {
    const order = this.order();
    if (!order || !order.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          shippingAddressId,
          billingAddressId
        })
      );
      if (updated) {
        this.order.set(updated);
      }
    } catch (err) {
      console.error('Error updating shipping info:', err);
    } finally {
      this.loading.set(false);
    }
  }

  canProceedToNext(): boolean {
    if (this.currentStep() === 'entry') {
      const subStep = this.currentEntrySubStep();
      const order = this.order();
      
      switch (subStep) {
        case 'customer':
          return !!order?.customerId;
        case 'products':
          return !!(order?.items && order.items.length > 0);
        case 'shipping':
          return !!order?.shippingAddressId && !!order?.billingAddressId;
        case 'review':
          return true;
        default:
          return false;
      }
    }
    
    switch (this.currentStep()) {
      case 'approval':
        return !!(this.creditCheckPassed() && this.inventoryConfirmed() && this.priceApproved());
      case 'confirmation':
        return true;
      case 'shipping_instruction':
        return !!this.requestedShipDate();
      case 'shipping':
        return !!this.actualShipDate();
      case 'invoicing':
        return !!this.invoiceNumber() && !!this.invoiceDate();
      case 'history':
        return true;
      default:
        return false;
    }
  }

  handleNext(): void {
    if (this.currentStep() === 'entry') {
      const currentSubIndex = this.entrySubSteps.findIndex(s => s.key === this.currentEntrySubStep());
      if (currentSubIndex < this.entrySubSteps.length - 1) {
        this.currentEntrySubStep.set(this.entrySubSteps[currentSubIndex + 1].key);
      } else {
        // Move to next main step
        const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
        if (currentIndex < this.steps.length - 1) {
          this.currentStep.set(this.steps[currentIndex + 1].key);
        }
      }
    } else {
      const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
      if (currentIndex < this.steps.length - 1) {
        const nextStep = this.steps[currentIndex + 1].key;
        this.currentStep.set(nextStep);
        // Auto-load invoice number when entering invoicing step
        if (nextStep === 'invoicing') {
          this.loadInvoiceNumber();
        }
      }
    }
  }

  handlePrevious(): void {
    if (this.currentStep() === 'entry') {
      const currentSubIndex = this.entrySubSteps.findIndex(s => s.key === this.currentEntrySubStep());
      if (currentSubIndex > 0) {
        this.currentEntrySubStep.set(this.entrySubSteps[currentSubIndex - 1].key);
      } else {
        // Move to previous main step
        const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
        if (currentIndex > 0) {
          this.currentStep.set(this.steps[currentIndex - 1].key);
        }
      }
    } else {
      const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
      if (currentIndex > 0) {
        if (this.steps[currentIndex - 1].key === 'entry') {
          this.currentStep.set('entry');
          this.currentEntrySubStep.set('review');
        } else {
          this.currentStep.set(this.steps[currentIndex - 1].key);
        }
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  async onStepClick(stepKey: OrderStep): Promise<void> {
    const isCompleted = this.isStepCompleted(stepKey);
    const isActive = this.currentStep() === stepKey;
    
    // Allow navigation to completed or active steps
    if (isCompleted || isActive) {
      const currentOrder = this.order();
      if (currentOrder?.id) {
        // Reload order to get latest data
        try {
          this.loading.set(true);
          const latestOrder = await firstValueFrom(this.orderService.getOrder(currentOrder.id));
          if (latestOrder) {
            this.order.set(latestOrder);
            // Load addresses if customer is set
            if (latestOrder.customerId) {
              await this.loadAddresses(latestOrder.customerId);
            }
            
            // Load step-specific data from jsonData
            if (latestOrder.jsonData) {
              switch (stepKey) {
                case 'approval':
                  this.approvalNotes.set(latestOrder.jsonData.approvalNotes || '');
                  this.creditCheckPassed.set(latestOrder.jsonData.creditCheckPassed || false);
                  this.inventoryConfirmed.set(latestOrder.jsonData.inventoryConfirmed || false);
                  this.priceApproved.set(latestOrder.jsonData.priceApproved || false);
                  break;
                case 'shipping_instruction':
                  this.shippingInstructions.set(latestOrder.jsonData.shippingInstructions || '');
                  const dateStr = latestOrder.jsonData.requestedShipDate;
                  this.requestedShipDate.set(dateStr ? new Date(dateStr) : null);
                  break;
                case 'shipping':
                  if (latestOrder.shipDate) {
                    this.actualShipDate.set(new Date(latestOrder.shipDate));
                  }
                  this.trackingNumber.set(latestOrder.jsonData.trackingNumber || '');
                  break;
                case 'invoicing':
                  this.invoiceNumber.set(latestOrder.invoiceNumber || latestOrder.jsonData.invoiceNumber || '');
                  if (latestOrder.invoiceDate) {
                    this.invoiceDate.set(new Date(latestOrder.invoiceDate));
                  } else if (latestOrder.jsonData.invoiceDate) {
                    const invDateStr = latestOrder.jsonData.invoiceDate;
                    this.invoiceDate.set(invDateStr ? new Date(invDateStr) : null);
                  }
                  // Auto-load invoice number if not set
                  if (!this.invoiceNumber()) {
                    await this.loadInvoiceNumber();
                  }
                  break;
              }
            }
          }
        } catch (err) {
          console.error('Error reloading order:', err);
        } finally {
          this.loading.set(false);
        }
      }
      
      this.currentStep.set(stepKey);
      // If navigating to entry step, set to review sub-step
      if (stepKey === 'entry') {
        this.currentEntrySubStep.set('review');
      }
    }
  }

  isStepCompleted(step: OrderStep): boolean {
    const order = this.order();
    if (!order) return false;

    switch (step) {
      case 'entry':
        return !!(order.customerId && order.items && order.items.length > 0 && order.shippingAddressId && order.billingAddressId);
      case 'approval':
        return order.status === 'APPROVED' || order.status === 'SHIPPING_INSTRUCTED' || order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'confirmation':
        return order.status === 'SHIPPING_INSTRUCTED' || order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'shipping_instruction':
        return order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'shipping':
        return order.status === 'INVOICED' || order.status === 'PAID';
      case 'invoicing':
        return order.status === 'INVOICED' || order.status === 'PAID';
      case 'history':
        return true;
      default:
        return false;
    }
  }

  isSubStepCompleted(subStep: EntrySubStep): boolean {
    const order = this.order();
    if (!order) return false;

    switch (subStep) {
      case 'customer':
        return !!order.customerId;
      case 'products':
        return !!(order.items && order.items.length > 0);
      case 'shipping':
        return !!order.shippingAddressId && !!order.billingAddressId;
      case 'review':
        return true;
      default:
        return false;
    }
  }

  getCustomerName(customerId?: string): string {
    if (!customerId) return '';
    const customer = this.customers().find(c => c.id === customerId);
    return customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || '';
  }

  getCurrentStepLabel(): string {
    const step = this.steps.find(s => s.key === this.currentStep());
    return step?.label || '';
  }

  async handleCompleteEntry(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) {
      alert('Order is not ready. Please wait a moment and try again.');
      return;
    }

    // Validate required fields
    if (!order.customerId) {
      alert('Please select a customer before completing the entry.');
      this.currentEntrySubStep.set('customer');
      return;
    }
    if (!order.items || order.items.length === 0) {
      alert('Please add at least one product before completing the entry.');
      this.currentEntrySubStep.set('products');
      return;
    }
    if (!order.shippingAddressId || !order.billingAddressId) {
      alert('Please select shipping and billing addresses before completing the entry.');
      this.currentEntrySubStep.set('shipping');
      return;
    }

    try {
      this.submitting.set(true);
      // Ensure all current order data is included
      const orderToUpdate: Order = {
        ...order,
        customerId: order.customerId,
        shippingAddressId: order.shippingAddressId,
        billingAddressId: order.billingAddressId,
        status: 'PENDING_APPROVAL'
      };
      
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, orderToUpdate)
      );
      if (updated) {
        this.order.set(updated);
        // Add history record
        await this.addHistoryRecord(
          'entry',
          this.translate.instant('orderEntry.history.step.entry'),
          '',
          'PENDING_APPROVAL',
          {
            customerId: order.customerId,
            itemCount: order.items?.length || 0,
            total: order.total || 0
          }
        );
        this.currentStep.set('approval');
        console.log('Entry completed successfully. Order:', updated);
      } else {
        console.error('Order update returned null or undefined');
        alert('Failed to complete entry. Please try again.');
      }
    } catch (err) {
      console.error('Error completing entry:', err);
      alert('Failed to complete entry. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async handleApproveOrder(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      this.submitting.set(true);
      const jsonData = order.jsonData || {};
      jsonData.approvalNotes = this.approvalNotes();
      jsonData.creditCheckPassed = this.creditCheckPassed();
      jsonData.inventoryConfirmed = this.inventoryConfirmed();
      jsonData.priceApproved = this.priceApproved();
      jsonData.approvedAt = new Date().toISOString();

      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          status: 'APPROVED',
          notes: this.approvalNotes() || order.notes,
          jsonData
        })
      );
      if (updated) {
        this.order.set(updated);
        // Add history record
        await this.addHistoryRecord(
          'approval',
          this.translate.instant('orderEntry.history.step.approval'),
          this.approvalNotes(),
          'APPROVED',
          {
            creditCheckPassed: this.creditCheckPassed(),
            inventoryConfirmed: this.inventoryConfirmed(),
            priceApproved: this.priceApproved()
          }
        );
        this.currentStep.set('confirmation');
      }
    } catch (err) {
      console.error('Error approving order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleConfirmOrder(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      this.submitting.set(true);
      const jsonData = order.jsonData || {};
      jsonData.confirmedAt = new Date().toISOString();

      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          jsonData
        })
      );
      if (updated) {
        this.order.set(updated);
        // Add history record
        await this.addHistoryRecord(
          'confirmation',
          this.translate.instant('orderEntry.history.step.confirmation'),
          '',
          order.status,
          {
            orderNumber: order.orderNumber
          }
        );
        this.currentStep.set('shipping_instruction');
      }
    } catch (err) {
      console.error('Error confirming order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleShippingInstruction(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      this.submitting.set(true);
      const jsonData = order.jsonData || {};
      jsonData.shippingInstructions = this.shippingInstructions();
      jsonData.requestedShipDate = this.requestedShipDate() ? this.requestedShipDate()!.toISOString().split('T')[0] : null;

      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          status: 'SHIPPING_INSTRUCTED',
          jsonData
        })
      );
      if (updated) {
        this.order.set(updated);
        // Add history record
        await this.addHistoryRecord(
          'shipping_instruction',
          this.translate.instant('orderEntry.history.step.shippingInstruction'),
          this.shippingInstructions(),
          'SHIPPING_INSTRUCTED',
          {
            requestedShipDate: this.requestedShipDate() ? this.requestedShipDate()!.toISOString().split('T')[0] : null
          }
        );
        this.currentStep.set('shipping');
      }
    } catch (err) {
      console.error('Error creating shipping instruction:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleShipOrder(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      this.submitting.set(true);
      const jsonData = order.jsonData || {};
      jsonData.trackingNumber = this.trackingNumber();
      const shipDate = this.actualShipDate() ? this.actualShipDate()!.toISOString() : new Date().toISOString();

      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          status: 'SHIPPED',
          shipDate: shipDate,
          jsonData
        })
      );
      if (updated) {
        this.order.set(updated);
        // Add history record
        await this.addHistoryRecord(
          'shipping',
          this.translate.instant('orderEntry.history.step.shipping'),
          '',
          'SHIPPED',
          {
            shipDate: shipDate,
            trackingNumber: this.trackingNumber()
          }
        );
        // Auto-load invoice number
        await this.loadInvoiceNumber();
        this.currentStep.set('invoicing');
      }
    } catch (err) {
      console.error('Error shipping order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleInvoiceOrder(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      this.submitting.set(true);
      const jsonData = order.jsonData || {};
      jsonData.invoiceNumber = this.invoiceNumber();
      const invoiceDateObj = this.invoiceDate() ? this.invoiceDate()!.toISOString() : undefined;
      jsonData.invoiceDate = invoiceDateObj ? invoiceDateObj.split('T')[0] : null;

      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          status: 'INVOICED',
          invoiceNumber: this.invoiceNumber() || undefined,
          invoiceDate: invoiceDateObj,
          jsonData
        })
      );
      if (updated) {
        this.order.set(updated);
        // Add history record
        await this.addHistoryRecord(
          'invoicing',
          this.translate.instant('orderEntry.history.step.invoicing'),
          '',
          'INVOICED',
          {
            invoiceNumber: this.invoiceNumber(),
            invoiceDate: this.invoiceDate(),
            total: order.total || 0
          }
        );
        this.currentStep.set('history');
      }
    } catch (err) {
      console.error('Error invoicing order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async loadInvoiceNumber(): Promise<void> {
    try {
      const response = await firstValueFrom(this.orderService.getNextInvoiceNumber());
      if (response && response.invoiceNumber) {
        this.invoiceNumber.set(response.invoiceNumber);
        if (!this.invoiceDate()) {
          this.invoiceDate.set(new Date());
        }
      }
    } catch (err) {
      console.error('Error loading invoice number:', err);
    }
  }

  async handleAddHistoryNote(): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    const note = this.historyNote();
    if (!note.trim()) return;

    try {
      this.submitting.set(true);
      const updatedNotes = order.notes ? `${order.notes}\n\n${note}` : note;
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          notes: updatedNotes
        })
      );
      if (updated) {
        this.order.set(updated);
        // Add history record for the note
        await this.addHistoryRecord(
          'note',
          this.translate.instant('orderEntry.history.step.note'),
          note,
          order.status
        );
        this.historyNote.set('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      this.submitting.set(false);
    }
  }


  private async addHistoryRecord(
    step: string,
    stepLabel: string,
    notes?: string,
    status?: string,
    data?: Record<string, any>
  ): Promise<void> {
    const order = this.order();
    if (!order || !order.id) return;

    try {
      const jsonData = order.jsonData || {};
      const history = jsonData.history || [];
      const newRecord = {
        step,
        stepLabel,
        timestamp: new Date().toISOString(),
        notes,
        status: status || order.status,
        data
      };
      jsonData.history = [...history, newRecord];
      
      const updated = await firstValueFrom(
        this.orderService.updateOrder(order.id, {
          ...order,
          jsonData
        })
      );
      if (updated) {
        this.order.set(updated);
      }
    } catch (err) {
      console.error('Error adding history record:', err);
    }
  }
}

