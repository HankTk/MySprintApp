import {Component, OnInit, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {AxButtonComponent, AxProgressComponent} from '@ui/components';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {RMA, CreateRMARequest} from '../../models/rma.model';
import {Order} from '../../../orders/models/order.model';
import {Customer} from '../../../customers/models/customer.model';
import {Product} from '../../../products/models/product.model';
import {RMAService} from '../../services/rma.service';
import {OrderService} from '../../../orders/services/order.service';
import {CustomerService} from '../../../customers/services/customer.service';
import {ProductService} from '../../../products/services/product.service';
import {RMAStep, EntrySubStep} from './types';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-rma-entry',
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
    AxButtonComponent,
    AxProgressComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
  ],
  templateUrl: './rma-entry.component.html',
  styleUrls: ['./rma-entry.component.scss']
})
export class RMAEntryComponent implements OnInit
{
  currentStep = signal<RMAStep>('entry');
  currentEntrySubStep = signal<EntrySubStep>('order');
  rma = signal<RMA | null>(null);
  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  selectedProduct = signal<string | null>(null);
  quantity = signal<number>(1);
  reason = signal<string>('');
  restockingFee = signal<number>(0);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  displayedColumns: string[] = ['product', 'quantity', 'returnedQuantity', 'unitPrice', 'lineTotal', 'reason', 'actions'];

  // Approval state
  approvalNotes = signal<string>('');

  // Received state
  receivedDate = signal<Date | null>(null);

  // Processed state
  processedDate = signal<Date | null>(null);

  // History state
  historyNote = signal<string>('');

  // Computed signal for RMA history
  rmaHistory = computed(() =>
  {
    const rma = this.rma();
    if (!rma?.jsonData?.history) return [];
    let history = rma.jsonData.history;
    if (typeof history === 'string')
    {
      try
      {
        const parsed = JSON.parse(history);
        history = parsed.history || parsed;
      }
      catch
      {
        return [];
      }
    }
    return Array.isArray(history) ? history : [];
  });

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rmaService = inject(RMAService);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private translate = inject(TranslateService);

  steps: { key: RMAStep; label: string }[] = [
    {key: 'entry', label: 'rmaEntry.step.entry'},
    {key: 'approval', label: 'rmaEntry.step.approval'},
    {key: 'received', label: 'rmaEntry.step.received'},
    {key: 'processed', label: 'rmaEntry.step.processed'},
    {key: 'history', label: 'rmaEntry.step.history'}
  ];

  entrySubSteps: { key: EntrySubStep; label: string }[] = [
    {key: 'order', label: 'rmaEntry.subStep.order'},
    {key: 'products', label: 'rmaEntry.subStep.products'},
    {key: 'reason', label: 'rmaEntry.subStep.reason'},
    {key: 'review', label: 'rmaEntry.subStep.review'}
  ];

  async ngOnInit(): Promise<void>
  {
    const rmaId = this.route.snapshot.paramMap.get('id');

    await this.loadOrders();
    await this.loadCustomers();
    await this.loadProducts();

    if (rmaId)
    {
      await this.loadRMA(rmaId);
    }
    else
    {
      await this.createNewRMA();
    }
  }

  private async createNewRMA(): Promise<void>
  {
    try
    {
      this.loading.set(true);
      const newRMA: Partial<RMA> =
          {
            status: 'DRAFT',
            items: [],
            subtotal: 0,
            tax: 0,
            restockingFee: 0,
            total: 0,
          };
      const created = await firstValueFrom(this.rmaService.createRMA(newRMA as CreateRMARequest));
      if (created && created.id)
      {
        this.rma.set(created);
      }
    }
    catch (err)
    {
      console.error('Error creating RMA:', err);
    }
    finally
    {
      this.loading.set(false);
    }
  }

  private async loadRMA(id: string): Promise<void>
  {
    try
    {
      this.loading.set(true);
      const rma = await firstValueFrom(this.rmaService.getRMA(id));
      if (rma)
      {
        this.rma.set(rma);
        if (rma.orderId)
        {
          await this.loadOrderProducts(rma.orderId);
        }
        this.restockingFee.set(rma.restockingFee || 0);
        // Set step based on RMA status
        this.setStepFromStatus(rma.status);
      }
    }
    catch (err)
    {
      console.error('Error loading RMA:', err);
    }
    finally
    {
      this.loading.set(false);
    }
  }

  private setStepFromStatus(status?: string): void
  {
    const rma = this.rma();

    switch (status)
    {
      case 'DRAFT':
        this.currentStep.set('entry');
        if (rma?.orderId)
        {
          if (rma.items && rma.items.length > 0)
          {
            if (rma.items.every(item => item.reason))
            {
              this.currentEntrySubStep.set('review');
            }
            else
            {
              this.currentEntrySubStep.set('reason');
            }
          }
          else
          {
            this.currentEntrySubStep.set('products');
          }
        }
        else
        {
          this.currentEntrySubStep.set('order');
        }
        break;
      case 'PENDING_APPROVAL':
        this.currentStep.set('approval');
        if (rma?.jsonData)
        {
          this.approvalNotes.set(rma.jsonData.approvalNotes || '');
        }
        break;
      case 'APPROVED':
        this.currentStep.set('received');
        if (rma?.jsonData)
        {
          const receivedDateStr = rma.jsonData.receivedDate;
          this.receivedDate.set(receivedDateStr ? new Date(receivedDateStr) : null);
        }
        break;
      case 'RECEIVED':
        this.currentStep.set('processed');
        if (rma?.jsonData)
        {
          const processedDateStr = rma.jsonData.processedDate;
          this.processedDate.set(processedDateStr ? new Date(processedDateStr) : null);
        }
        break;
      case 'PROCESSED':
        this.currentStep.set('history');
        break;
      default:
        this.currentStep.set('entry');
        this.currentEntrySubStep.set('order');
    }
  }

  private async loadOrders(): Promise<void>
  {
    try
    {
      const orders = await firstValueFrom(this.orderService.getOrders());
      // Filter to only show orders that can be returned (SHIPPED, INVOICED, PAID)
      const returnableOrders = orders.filter(o =>
          o.status === 'SHIPPED' || o.status === 'INVOICED' || o.status === 'PAID'
      );
      this.orders.set(returnableOrders);
    }
    catch (err)
    {
      console.error('Error loading orders:', err);
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
      const activeProducts = products.filter(p => p.active !== false);
      this.products.set(activeProducts);
    }
    catch (err)
    {
      console.error('Error loading products:', err);
    }
  }

  private async loadOrderProducts(orderId: string): Promise<void>
  {
    try
    {
      const order = await firstValueFrom(this.orderService.getOrder(orderId));
      if (order && order.items)
      {
        // Update products list to include products from the selected order
        const orderProductIds = order.items.map(item => item.productId).filter(Boolean) as string[];
        const allProducts = this.products();
        const orderProducts = allProducts.filter(p => orderProductIds.includes(p.id!));
        // Keep all products but prioritize order products
        this.products.set([...orderProducts, ...allProducts.filter(p => !orderProductIds.includes(p.id!))]);
      }
    }
    catch (err)
    {
      console.error('Error loading order products:', err);
    }
  }

  async onOrderChange(orderId: string | null): Promise<void>
  {
    const normalizedOrderId = orderId && orderId.trim() !== '' ? orderId : undefined;

    if (!normalizedOrderId)
    {
      const rma = this.rma();
      if (rma && rma.id)
      {
        try
        {
          this.loading.set(true);
          const updated = await firstValueFrom(
              this.rmaService.updateRMA(rma.id, {...rma, orderId: undefined, customerId: undefined})
          );
          if (updated)
          {
            this.rma.set(updated);
          }
        }
        catch (err)
        {
          console.error('Error clearing order:', err);
        }
        finally
        {
          this.loading.set(false);
        }
      }
      return;
    }

    let rma = this.rma();
    if (!rma || !rma.id)
    {
      let retries = 0;
      while ((!rma || !rma.id) && retries < 10)
      {
        await new Promise(resolve => setTimeout(resolve, 100));
        rma = this.rma();
        retries++;
      }

      if (!rma || !rma.id)
      {
        console.error('RMA not available. Cannot update order.');
        alert('RMA is not ready yet. Please wait a moment and try again.');
        return;
      }
    }

    try
    {
      this.loading.set(true);
      const order = await firstValueFrom(this.orderService.getOrder(normalizedOrderId));
      if (order)
      {
        const rmaToUpdate =
            {
              ...rma,
              orderId: normalizedOrderId,
              orderNumber: order.orderNumber,
              customerId: order.customerId,
              customerName: order.customerId ? this.getCustomerName(order.customerId) : undefined
            };
        const updated = await firstValueFrom(
            this.rmaService.updateRMA(rma.id, rmaToUpdate)
        );
        if (updated)
        {
          this.rma.set(updated);
          await this.loadOrderProducts(normalizedOrderId);
        }
      }
    }
    catch (err)
    {
      console.error('Error updating order:', err);
      alert('Failed to update order. Please try again.');
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
    const returnReason = this.reason();
    const rma = this.rma();

    if (!productId || !rma || !rma.id)
    {
      return;
    }

    try
    {
      this.loading.set(true);
      const updated = await firstValueFrom(
          this.rmaService.addRMAItem(rma.id, productId, qty, returnReason)
      );
      if (updated)
      {
        this.rma.set(updated);
        this.selectedProduct.set(null);
        this.quantity.set(1);
        this.reason.set('');
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

    const rma = this.rma();
    if (!rma || !rma.id)
    {
      return;
    }

    try
    {
      this.loading.set(true);
      const updated = await firstValueFrom(
          this.rmaService.updateRMAItemQuantity(rma.id, itemId, quantity)
      );
      if (updated)
      {
        this.rma.set(updated);
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

  async onUpdateReturnedQuantity(itemId: string, returnedQuantity: number): Promise<void>
  {
    if (returnedQuantity < 0) return;

    const rma = this.rma();
    if (!rma || !rma.id)
    {
      return;
    }

    const item = rma.items?.find(i => i.id === itemId);
    if (item && item.quantity && returnedQuantity > item.quantity)
    {
      alert(`Returned quantity cannot exceed requested quantity (${item.quantity})`);
      return;
    }

    try
    {
      this.loading.set(true);
      const updated = await firstValueFrom(
          this.rmaService.updateRMAItemReturnedQuantity(rma.id, itemId, returnedQuantity)
      );
      if (updated)
      {
        this.rma.set(updated);
      }
    }
    catch (err)
    {
      console.error('Error updating returned quantity:', err);
    }
    finally
    {
      this.loading.set(false);
    }
  }

  async onUpdateReason(itemId: string, reason: string): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id)
    {
      return;
    }

    try
    {
      this.loading.set(true);
      const items = rma.items?.map(item =>
          item.id === itemId ? {...item, reason} : item
      ) || [];
      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {...rma, items})
      );
      if (updated)
      {
        this.rma.set(updated);
      }
    }
    catch (err)
    {
      console.error('Error updating reason:', err);
    }
    finally
    {
      this.loading.set(false);
    }
  }

  async onRemoveItem(itemId: string): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id)
    {
      return;
    }

    try
    {
      this.loading.set(true);
      const updated = await firstValueFrom(
          this.rmaService.removeRMAItem(rma.id, itemId)
      );
      if (updated)
      {
        this.rma.set(updated);
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

  async onRestockingFeeChange(fee: number): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id)
    {
      return;
    }

    try
    {
      this.loading.set(true);
      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {...rma, restockingFee: fee})
      );
      if (updated)
      {
        this.rma.set(updated);
        this.restockingFee.set(fee);
      }
    }
    catch (err)
    {
      console.error('Error updating restocking fee:', err);
    }
    finally
    {
      this.loading.set(false);
    }
  }

  canProceedToNext(): boolean
  {
    if (this.currentStep() === 'entry')
    {
      const subStep = this.currentEntrySubStep();
      const rma = this.rma();

      switch (subStep)
      {
        case 'order':
          return !!rma?.orderId;
        case 'products':
          return !!(rma?.items && rma.items.length > 0);
        case 'reason':
          return !!(rma?.items && rma.items.every(item => item.reason && item.reason.trim() !== ''));
        case 'review':
          return true;
        default:
          return false;
      }
    }

    switch (this.currentStep())
    {
      case 'approval':
        return !!this.approvalNotes();
      case 'received':
        return !!this.receivedDate();
      case 'processed':
        return !!this.processedDate();
      case 'history':
        return true;
      default:
        return false;
    }
  }

  handleNext(): void
  {
    if (this.currentStep() === 'entry')
    {
      const currentSubIndex = this.entrySubSteps.findIndex(s => s.key === this.currentEntrySubStep());
      if (currentSubIndex < this.entrySubSteps.length - 1)
      {
        this.currentEntrySubStep.set(this.entrySubSteps[currentSubIndex + 1].key);
      }
      else
      {
        const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
        if (currentIndex < this.steps.length - 1)
        {
          this.currentStep.set(this.steps[currentIndex + 1].key);
        }
      }
    }
    else
    {
      const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
      if (currentIndex < this.steps.length - 1)
      {
        this.currentStep.set(this.steps[currentIndex + 1].key);
      }
    }
  }

  handlePrevious(): void
  {
    if (this.currentStep() === 'entry')
    {
      const currentSubIndex = this.entrySubSteps.findIndex(s => s.key === this.currentEntrySubStep());
      if (currentSubIndex > 0)
      {
        this.currentEntrySubStep.set(this.entrySubSteps[currentSubIndex - 1].key);
      }
      else
      {
        const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
        if (currentIndex > 0)
        {
          this.currentStep.set(this.steps[currentIndex - 1].key);
        }
      }
    }
    else
    {
      const currentIndex = this.steps.findIndex(s => s.key === this.currentStep());
      if (currentIndex > 0)
      {
        if (this.steps[currentIndex - 1].key === 'entry')
        {
          this.currentStep.set('entry');
          this.currentEntrySubStep.set('review');
        }
        else
        {
          this.currentStep.set(this.steps[currentIndex - 1].key);
        }
      }
    }
  }

  goBack(): void
  {
    this.router.navigate(['/rmas']);
  }

  async onStepClick(stepKey: RMAStep): Promise<void>
  {
    const isCompleted = this.isStepCompleted(stepKey);
    const isActive = this.currentStep() === stepKey;

    if (isCompleted || isActive)
    {
      const currentRMA = this.rma();
      if (currentRMA?.id)
      {
        try
        {
          this.loading.set(true);
          const latestRMA = await firstValueFrom(this.rmaService.getRMA(currentRMA.id));
          if (latestRMA)
          {
            this.rma.set(latestRMA);
            if (latestRMA.orderId)
            {
              await this.loadOrderProducts(latestRMA.orderId);
            }

            if (latestRMA.jsonData)
            {
              switch (stepKey)
              {
                case 'approval':
                  this.approvalNotes.set(latestRMA.jsonData.approvalNotes || '');
                  break;
                case 'received':
                  const receivedDateStr = latestRMA.jsonData.receivedDate;
                  this.receivedDate.set(receivedDateStr ? new Date(receivedDateStr) : null);
                  break;
                case 'processed':
                  const processedDateStr = latestRMA.jsonData.processedDate;
                  this.processedDate.set(processedDateStr ? new Date(processedDateStr) : null);
                  break;
              }
            }
          }
        }
        catch (err)
        {
          console.error('Error reloading RMA:', err);
        }
        finally
        {
          this.loading.set(false);
        }
      }

      this.currentStep.set(stepKey);
      if (stepKey === 'entry')
      {
        this.currentEntrySubStep.set('review');
      }
    }
  }

  isStepCompleted(step: RMAStep): boolean
  {
    const rma = this.rma();
    if (!rma) return false;

    switch (step)
    {
      case 'entry':
        return !!(rma.orderId && rma.items && rma.items.length > 0 && rma.items.every(item => item.reason));
      case 'approval':
        return rma.status === 'APPROVED' || rma.status === 'RECEIVED' || rma.status === 'PROCESSED';
      case 'received':
        return rma.status === 'RECEIVED' || rma.status === 'PROCESSED';
      case 'processed':
        return rma.status === 'PROCESSED';
      case 'history':
        return true;
      default:
        return false;
    }
  }

  isSubStepCompleted(subStep: EntrySubStep): boolean
  {
    const rma = this.rma();
    if (!rma) return false;

    switch (subStep)
    {
      case 'order':
        return !!rma.orderId;
      case 'products':
        return !!(rma.items && rma.items.length > 0);
      case 'reason':
        return !!(rma.items && rma.items.every(item => item.reason && item.reason.trim() !== ''));
      case 'review':
        return true;
      default:
        return false;
    }
  }

  getOrderNumber(orderId?: string): string
  {
    if (!orderId) return '';
    const order = this.orders().find(o => o.id === orderId);
    return order?.orderNumber || '';
  }

  getCustomerName(customerId?: string): string
  {
    if (!customerId) return '';
    const customer = this.customers().find(c => c.id === customerId);
    return customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || '';
  }

  getProductName(productId?: string): string
  {
    if (!productId) return '';
    const product = this.products().find(p => p.id === productId);
    return product?.productName || product?.productCode || '';
  }

  getCurrentStepLabel(): string
  {
    const step = this.steps.find(s => s.key === this.currentStep());
    return step?.label || '';
  }

  async handleCompleteEntry(): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id)
    {
      alert('RMA is not ready. Please wait a moment and try again.');
      return;
    }

    if (!rma.orderId)
    {
      alert('Please select an order before completing the entry.');
      this.currentEntrySubStep.set('order');
      return;
    }
    if (!rma.items || rma.items.length === 0)
    {
      alert('Please add at least one product before completing the entry.');
      this.currentEntrySubStep.set('products');
      return;
    }
    if (!rma.items.every(item => item.reason && item.reason.trim() !== ''))
    {
      alert('Please provide a reason for all items before completing the entry.');
      this.currentEntrySubStep.set('reason');
      return;
    }

    try
    {
      this.submitting.set(true);
      const rmaToUpdate: RMA =
          {
            ...rma,
            orderId: rma.orderId,
            restockingFee: this.restockingFee(),
            status: 'PENDING_APPROVAL'
          };

      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, rmaToUpdate)
      );
      if (updated)
      {
        this.rma.set(updated);
        await this.addHistoryRecord(
            'entry',
            this.translate.instant('rmaEntry.history.step.entry'),
            '',
            'PENDING_APPROVAL',
            {
              orderId: rma.orderId,
              itemCount: rma.items?.length || 0,
              total: rma.total || 0
            }
        );
        this.currentStep.set('approval');
      }
    }
    catch (err)
    {
      console.error('Error completing entry:', err);
      alert('Failed to complete entry. Please try again.');
    }
    finally
    {
      this.submitting.set(false);
    }
  }

  async handleApproveRMA(): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id) return;

    try
    {
      this.submitting.set(true);
      const jsonData = rma.jsonData || {};
      jsonData.approvalNotes = this.approvalNotes();
      jsonData.approvedAt = new Date().toISOString();

      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {
            ...rma,
            status: 'APPROVED',
            notes: this.approvalNotes() || rma.notes,
            jsonData
          })
      );
      if (updated)
      {
        this.rma.set(updated);
        await this.addHistoryRecord(
            'approval',
            this.translate.instant('rmaEntry.history.step.approval'),
            this.approvalNotes(),
            'APPROVED',
            {}
        );
        this.currentStep.set('received');
      }
    }
    catch (err)
    {
      console.error('Error approving RMA:', err);
    }
    finally
    {
      this.submitting.set(false);
    }
  }

  async handleReceiveRMA(): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id) return;

    try
    {
      this.submitting.set(true);
      const jsonData = rma.jsonData || {};
      jsonData.receivedDate = this.receivedDate() ? this.receivedDate()!.toISOString().split('T')[0] : null;
      jsonData.receivedAt = new Date().toISOString();
      const receivedDateObj = this.receivedDate() ? this.receivedDate()!.toISOString() : undefined;

      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {
            ...rma,
            status: 'RECEIVED',
            receivedDate: receivedDateObj,
            jsonData
          })
      );
      if (updated)
      {
        this.rma.set(updated);
        await this.addHistoryRecord(
            'received',
            this.translate.instant('rmaEntry.history.step.received'),
            '',
            'RECEIVED',
            {
              receivedDate: this.receivedDate() ? this.receivedDate()!.toISOString().split('T')[0] : null
            }
        );
        this.currentStep.set('processed');
      }
    }
    catch (err)
    {
      console.error('Error receiving RMA:', err);
    }
    finally
    {
      this.submitting.set(false);
    }
  }

  async handleProcessRMA(): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id) return;

    try
    {
      this.submitting.set(true);
      const jsonData = rma.jsonData || {};
      jsonData.processedDate = this.processedDate() ? this.processedDate()!.toISOString().split('T')[0] : null;
      jsonData.processedAt = new Date().toISOString();
      const processedDateObj = this.processedDate() ? this.processedDate()!.toISOString() : undefined;

      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {
            ...rma,
            status: 'PROCESSED',
            jsonData
          })
      );
      if (updated)
      {
        this.rma.set(updated);
        await this.addHistoryRecord(
            'processed',
            this.translate.instant('rmaEntry.history.step.processed'),
            '',
            'PROCESSED',
            {
              processedDate: this.processedDate() ? this.processedDate()!.toISOString().split('T')[0] : null,
              total: rma.total || 0
            }
        );
        this.currentStep.set('history');
      }
    }
    catch (err)
    {
      console.error('Error processing RMA:', err);
    }
    finally
    {
      this.submitting.set(false);
    }
  }

  async handleAddHistoryNote(): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id) return;

    const note = this.historyNote();
    if (!note.trim()) return;

    try
    {
      this.submitting.set(true);
      const updatedNotes = rma.notes ? `${rma.notes}\n\n${note}` : note;
      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {
            ...rma,
            notes: updatedNotes
          })
      );
      if (updated)
      {
        this.rma.set(updated);
        await this.addHistoryRecord(
            'note',
            this.translate.instant('rmaEntry.history.step.note'),
            note,
            rma.status
        );
        this.historyNote.set('');
      }
    }
    catch (err)
    {
      console.error('Error adding note:', err);
    }
    finally
    {
      this.submitting.set(false);
    }
  }

  private async addHistoryRecord(
      step: string,
      stepLabel: string,
      notes?: string,
      status?: string,
      data?: Record<string, any>
  ): Promise<void>
  {
    const rma = this.rma();
    if (!rma || !rma.id) return;

    try
    {
      const jsonData = rma.jsonData || {};
      const history = jsonData.history || [];
      const newRecord =
          {
            step,
            stepLabel,
            timestamp: new Date().toISOString(),
            notes,
            status: status || rma.status,
            data
          };
      jsonData.history = [...history, newRecord];

      const updated = await firstValueFrom(
          this.rmaService.updateRMA(rma.id, {
            ...rma,
            jsonData
          })
      );
      if (updated)
      {
        this.rma.set(updated);
      }
    }
    catch (err)
    {
      console.error('Error adding history record:', err);
    }
  }

  hasDataKeys(data?: Record<string, any>): boolean
  {
    return !!(data && Object.keys(data).length > 0);
  }

  toString(value: string | number | symbol): string
  {
    return String(value);
  }

  getDataKeyLabel(key: string): string
  {
    return `rmaEntry.history.data.${key}`;
  }

  formatDataValue(key: string, value: any): string
  {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    return String(value);
  }
}

