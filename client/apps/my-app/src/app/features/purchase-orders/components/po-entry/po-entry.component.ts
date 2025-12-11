import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PurchaseOrder, CreatePurchaseOrderRequest } from '../../models/purchase-order.model';
import { Vendor } from '../../../vendors/models/vendor.model';
import { Product } from '../../../products/models/product.model';
import { Address } from '../../../addresses/models/address.model';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { VendorService } from '../../../vendors/services/vendor.service';
import { ProductService } from '../../../products/services/product.service';
import { AddressService } from '../../../addresses/services/address.service';
import { PurchaseOrderStep, EntrySubStep } from './types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-po-entry',
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
    MatProgressSpinnerModule,
    MatDatepickerModule,
    TranslateModule
  ],
  templateUrl: './po-entry.component.html',
  styleUrls: ['./po-entry.component.scss']
})
export class PurchaseOrderEntryComponent implements OnInit {
  currentStep = signal<PurchaseOrderStep>('entry');
  currentEntrySubStep = signal<EntrySubStep>('supplier');
  po = signal<PurchaseOrder | null>(null);
  vendors = signal<Vendor[]>([]);
  products = signal<Product[]>([]);
  addresses = signal<Address[]>([]);
  selectedProduct = signal<string | null>(null);
  quantity = signal<number>(1);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'lineTotal', 'actions'];

  // Shipping address state
  shippingId = signal<string | null>(null);
  billingId = signal<string | null>(null);
  expectedDeliveryDate = signal<string>('');

  // Approval state
  approvalNotes = signal<string>('');

  // Received state
  receivedDate = signal<string>('');

  // Invoicing state
  invoiceNumber = signal<string>('');
  invoiceDate = signal<string>('');

  // History state
  historyNote = signal<string>('');
  
  // Computed signal for PO history
  poHistory = computed(() => {
    const po = this.po();
    if (!po?.jsonData?.history) return [];
    let history = po.jsonData.history;
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
  private poService = inject(PurchaseOrderService);
  private vendorService = inject(VendorService);
  private productService = inject(ProductService);
  private addressService = inject(AddressService);
  private translate = inject(TranslateService);

  steps: { key: PurchaseOrderStep; label: string }[] = [
    { key: 'entry', label: 'purchaseOrderEntry.step.entry' },
    { key: 'approval', label: 'purchaseOrderEntry.step.approval' },
    { key: 'received', label: 'purchaseOrderEntry.step.received' },
    { key: 'invoicing', label: 'purchaseOrderEntry.step.invoicing' },
    { key: 'history', label: 'purchaseOrderEntry.step.history' }
  ];

  entrySubSteps: { key: EntrySubStep; label: string }[] = [
    { key: 'supplier', label: 'purchaseOrderEntry.subStep.supplier' },
    { key: 'products', label: 'purchaseOrderEntry.subStep.products' },
    { key: 'shipping', label: 'purchaseOrderEntry.subStep.shipping' },
    { key: 'review', label: 'purchaseOrderEntry.subStep.review' }
  ];

  async ngOnInit(): Promise<void> {
    const poId = this.route.snapshot.paramMap.get('id');
    
    await this.loadVendors();
    await this.loadProducts();

    if (poId) {
      await this.loadPurchaseOrder(poId);
    } else {
      await this.createNewPurchaseOrder();
    }
  }

  private async createNewPurchaseOrder(): Promise<void> {
    try {
      this.loading.set(true);
      const newPO: Partial<PurchaseOrder> = {
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
      };
      const created = await firstValueFrom(this.poService.createPurchaseOrder(newPO as CreatePurchaseOrderRequest));
      if (created && created.id) {
        this.po.set(created);
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPurchaseOrder(id: string): Promise<void> {
    try {
      this.loading.set(true);
      const po = await firstValueFrom(this.poService.getPurchaseOrder(id));
      if (po) {
        this.po.set(po);
        if (po.supplierId) {
          await this.loadAddresses(po.supplierId);
        }
        // Set step based on PO status
        await this.setStepFromStatus(po.status);
      }
    } catch (err) {
      console.error('Error loading purchase order:', err);
    } finally {
      this.loading.set(false);
    }
  }

  private async setStepFromStatus(status?: string): Promise<void> {
    const po = this.po();
    
    switch (status) {
      case 'DRAFT':
        this.currentStep.set('entry');
        if (po?.supplierId) {
          if (po.items && po.items.length > 0) {
            if (po.shippingAddressId && po.billingAddressId) {
              this.currentEntrySubStep.set('review');
            } else {
              this.currentEntrySubStep.set('shipping');
            }
          } else {
            this.currentEntrySubStep.set('products');
          }
        } else {
          this.currentEntrySubStep.set('supplier');
        }
        break;
      case 'PENDING_APPROVAL':
        this.currentStep.set('approval');
        if (po?.jsonData) {
          this.approvalNotes.set(po.jsonData.approvalNotes || '');
        }
        break;
      case 'APPROVED':
        this.currentStep.set('received');
        if (po?.jsonData) {
          this.receivedDate.set(po.jsonData.receivedDate || '');
        }
        break;
      case 'RECEIVED':
        this.currentStep.set('invoicing');
        if (po) {
          this.invoiceNumber.set(po.invoiceNumber || po.jsonData?.invoiceNumber || '');
          if (po.invoiceDate) {
            this.invoiceDate.set(new Date(po.invoiceDate).toISOString().split('T')[0]);
          } else if (po.jsonData?.invoiceDate) {
            this.invoiceDate.set(po.jsonData.invoiceDate);
          }
          if (!this.invoiceNumber()) {
            await this.loadInvoiceNumber();
          }
        }
        break;
      case 'INVOICED':
      case 'PAID':
        this.currentStep.set('history');
        if (po) {
          this.invoiceNumber.set(po.invoiceNumber || po.jsonData?.invoiceNumber || '');
          if (po.invoiceDate) {
            this.invoiceDate.set(new Date(po.invoiceDate).toISOString().split('T')[0]);
          } else if (po.jsonData?.invoiceDate) {
            this.invoiceDate.set(po.jsonData.invoiceDate);
          }
        }
        break;
      default:
        this.currentStep.set('entry');
        this.currentEntrySubStep.set('supplier');
    }
  }

  private async loadVendors(): Promise<void> {
    try {
      const vendors = await firstValueFrom(this.vendorService.getVendors());
      this.vendors.set(vendors);
    } catch (err) {
      console.error('Error loading vendors:', err);
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

  private async loadAddresses(vendorId: string): Promise<void> {
    try {
      const addresses = await firstValueFrom(this.addressService.getAddressesByVendorId(vendorId));
      this.addresses.set(addresses);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  }

  async onSupplierChange(supplierId: string | null): Promise<void> {
    const normalizedSupplierId = supplierId && supplierId.trim() !== '' ? supplierId : undefined;
    
    if (!normalizedSupplierId) {
      this.addresses.set([]);
      const po = this.po();
      if (po && po.id) {
        try {
          this.loading.set(true);
          const updated = await firstValueFrom(
            this.poService.updatePurchaseOrder(po.id, { ...po, supplierId: undefined })
          );
          if (updated) {
            this.po.set(updated);
          }
        } catch (err) {
          console.error('Error clearing supplier:', err);
        } finally {
          this.loading.set(false);
        }
      }
      return;
    }
    
    let po = this.po();
    if (!po || !po.id) {
      let retries = 0;
      while ((!po || !po.id) && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        po = this.po();
        retries++;
      }
      
      if (!po || !po.id) {
        console.error('Purchase order not available. Cannot update supplier.');
        alert('Purchase order is not ready yet. Please wait a moment and try again.');
        return;
      }
    }

    try {
      this.loading.set(true);
      const poToUpdate = { ...po, supplierId: normalizedSupplierId };
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, poToUpdate)
      );
      if (updated) {
        this.po.set(updated);
        await this.loadAddresses(normalizedSupplierId);
      }
    } catch (err) {
      console.error('Error updating supplier:', err);
      alert('Failed to update supplier. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  async onAddProduct(): Promise<void> {
    const productId = this.selectedProduct();
    const qty = this.quantity();
    const po = this.po();

    if (!productId || !po || !po.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.poService.addPurchaseOrderItem(po.id, productId, qty)
      );
      if (updated) {
        this.po.set(updated);
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
    
    const po = this.po();
    if (!po || !po.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrderItemQuantity(po.id, itemId, quantity)
      );
      if (updated) {
        this.po.set(updated);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onRemoveItem(itemId: string): Promise<void> {
    const po = this.po();
    if (!po || !po.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.poService.removePurchaseOrderItem(po.id, itemId)
      );
      if (updated) {
        this.po.set(updated);
      }
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onShippingInfoChange(shippingAddressId: string, billingAddressId: string): Promise<void> {
    const po = this.po();
    if (!po || !po.id) {
      return;
    }

    try {
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          shippingAddressId,
          billingAddressId
        })
      );
      if (updated) {
        this.po.set(updated);
        this.shippingId.set(shippingAddressId);
        this.billingId.set(billingAddressId);
      }
    } catch (err) {
      console.error('Error updating shipping info:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async onExpectedDeliveryDateChange(date: string): Promise<void> {
    const po = this.po();
    if (!po || !po.id) {
      return;
    }

    try {
      this.loading.set(true);
      const dateObj = date ? new Date(date + 'T00:00:00').toISOString() : undefined;
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          expectedDeliveryDate: dateObj
        })
      );
      if (updated) {
        this.po.set(updated);
        this.expectedDeliveryDate.set(date);
      }
    } catch (err) {
      console.error('Error updating expected delivery date:', err);
    } finally {
      this.loading.set(false);
    }
  }

  canProceedToNext(): boolean {
    if (this.currentStep() === 'entry') {
      const subStep = this.currentEntrySubStep();
      const po = this.po();
      
      switch (subStep) {
        case 'supplier':
          return !!po?.supplierId;
        case 'products':
          return !!(po?.items && po.items.length > 0);
        case 'shipping':
          return !!po?.shippingAddressId && !!po?.billingAddressId;
        case 'review':
          return true;
        default:
          return false;
      }
    }
    
    switch (this.currentStep()) {
      case 'approval':
        return !!this.approvalNotes();
      case 'received':
        return !!this.receivedDate();
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
    this.router.navigate(['/purchase-orders']);
  }

  async onStepClick(stepKey: PurchaseOrderStep): Promise<void> {
    const isCompleted = this.isStepCompleted(stepKey);
    const isActive = this.currentStep() === stepKey;
    
    if (isCompleted || isActive) {
      const currentPO = this.po();
      if (currentPO?.id) {
        try {
          this.loading.set(true);
          const latestPO = await firstValueFrom(this.poService.getPurchaseOrder(currentPO.id));
          if (latestPO) {
            this.po.set(latestPO);
            if (latestPO.supplierId) {
              await this.loadAddresses(latestPO.supplierId);
            }
            
            if (latestPO.jsonData) {
              switch (stepKey) {
                case 'approval':
                  this.approvalNotes.set(latestPO.jsonData.approvalNotes || '');
                  break;
                case 'received':
                  this.receivedDate.set(latestPO.jsonData.receivedDate || '');
                  break;
                case 'invoicing':
                  this.invoiceNumber.set(latestPO.invoiceNumber || latestPO.jsonData.invoiceNumber || '');
                  if (latestPO.invoiceDate) {
                    this.invoiceDate.set(new Date(latestPO.invoiceDate).toISOString().split('T')[0]);
                  } else if (latestPO.jsonData.invoiceDate) {
                    this.invoiceDate.set(latestPO.jsonData.invoiceDate);
                  }
                  if (!this.invoiceNumber()) {
                    await this.loadInvoiceNumber();
                  }
                  break;
              }
            }
          }
        } catch (err) {
          console.error('Error reloading purchase order:', err);
        } finally {
          this.loading.set(false);
        }
      }
      
      this.currentStep.set(stepKey);
      if (stepKey === 'entry') {
        this.currentEntrySubStep.set('review');
      }
    }
  }

  isStepCompleted(step: PurchaseOrderStep): boolean {
    const po = this.po();
    if (!po) return false;

    switch (step) {
      case 'entry':
        return !!(po.supplierId && po.items && po.items.length > 0 && po.shippingAddressId && po.billingAddressId);
      case 'approval':
        return po.status === 'APPROVED' || po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID';
      case 'received':
        return po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID';
      case 'invoicing':
        return po.status === 'INVOICED' || po.status === 'PAID';
      case 'history':
        return true;
      default:
        return false;
    }
  }

  isSubStepCompleted(subStep: EntrySubStep): boolean {
    const po = this.po();
    if (!po) return false;

    switch (subStep) {
      case 'supplier':
        return !!po.supplierId;
      case 'products':
        return !!(po.items && po.items.length > 0);
      case 'shipping':
        return !!po.shippingAddressId && !!po.billingAddressId;
      case 'review':
        return true;
      default:
        return false;
    }
  }

  getVendorName(vendorId?: string): string {
    if (!vendorId) return '';
    const vendor = this.vendors().find(v => v.id === vendorId);
    return vendor?.companyName || `${vendor?.firstName || ''} ${vendor?.lastName || ''}`.trim() || '';
  }

  getProductName(productId?: string): string {
    if (!productId) return '';
    const product = this.products().find(p => p.id === productId);
    return product?.productName || product?.productCode || '';
  }

  getAddressLabel(addressId?: string): string {
    if (!addressId) return '';
    const address = this.addresses().find(a => a.id === addressId);
    if (!address) return '';
    return `${address.streetAddress1 || ''}, ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`.trim();
  }

  getCurrentStepLabel(): string {
    const step = this.steps.find(s => s.key === this.currentStep());
    return step?.label || '';
  }

  async handleCompleteEntry(): Promise<void> {
    const po = this.po();
    if (!po || !po.id) {
      alert('Purchase order is not ready. Please wait a moment and try again.');
      return;
    }

    if (!po.supplierId) {
      alert('Please select a supplier before completing the entry.');
      this.currentEntrySubStep.set('supplier');
      return;
    }
    if (!po.items || po.items.length === 0) {
      alert('Please add at least one product before completing the entry.');
      this.currentEntrySubStep.set('products');
      return;
    }
    if (!po.shippingAddressId || !po.billingAddressId) {
      alert('Please select shipping and billing addresses before completing the entry.');
      this.currentEntrySubStep.set('shipping');
      return;
    }

    try {
      this.submitting.set(true);
      const poToUpdate: PurchaseOrder = {
        ...po,
        supplierId: po.supplierId,
        shippingAddressId: po.shippingAddressId,
        billingAddressId: po.billingAddressId,
        status: 'PENDING_APPROVAL'
      };
      
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, poToUpdate)
      );
      if (updated) {
        this.po.set(updated);
        await this.addHistoryRecord(
          'entry',
          this.translate.instant('purchaseOrderEntry.history.step.entry'),
          '',
          'PENDING_APPROVAL',
          {
            supplierId: po.supplierId,
            itemCount: po.items?.length || 0,
            total: po.total || 0
          }
        );
        this.currentStep.set('approval');
      }
    } catch (err) {
      console.error('Error completing entry:', err);
      alert('Failed to complete entry. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }

  async handleApprovePO(): Promise<void> {
    const po = this.po();
    if (!po || !po.id) return;

    try {
      this.submitting.set(true);
      const jsonData = po.jsonData || {};
      jsonData.approvalNotes = this.approvalNotes();
      jsonData.approvedAt = new Date().toISOString();

      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          status: 'APPROVED',
          notes: this.approvalNotes() || po.notes,
          jsonData
        })
      );
      if (updated) {
        this.po.set(updated);
        await this.addHistoryRecord(
          'approval',
          this.translate.instant('purchaseOrderEntry.history.step.approval'),
          this.approvalNotes(),
          'APPROVED',
          {}
        );
        this.currentStep.set('received');
      }
    } catch (err) {
      console.error('Error approving purchase order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleReceivePO(): Promise<void> {
    const po = this.po();
    if (!po || !po.id) return;

    try {
      this.submitting.set(true);
      const jsonData = po.jsonData || {};
      jsonData.receivedDate = this.receivedDate();
      jsonData.receivedAt = new Date().toISOString();

      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          status: 'RECEIVED',
          jsonData
        })
      );
      if (updated) {
        this.po.set(updated);
        await this.addHistoryRecord(
          'received',
          this.translate.instant('purchaseOrderEntry.history.step.received'),
          '',
          'RECEIVED',
          {
            receivedDate: this.receivedDate()
          }
        );
        await this.loadInvoiceNumber();
        this.currentStep.set('invoicing');
      }
    } catch (err) {
      console.error('Error receiving purchase order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async handleInvoicePO(): Promise<void> {
    const po = this.po();
    if (!po || !po.id) return;

    try {
      this.submitting.set(true);
      const jsonData = po.jsonData || {};
      jsonData.invoiceNumber = this.invoiceNumber();
      jsonData.invoiceDate = this.invoiceDate();
      const invoiceDateObj = this.invoiceDate() ? new Date(this.invoiceDate() + 'T00:00:00').toISOString() : undefined;

      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          status: 'INVOICED',
          invoiceNumber: this.invoiceNumber() || undefined,
          invoiceDate: invoiceDateObj,
          jsonData
        })
      );
      if (updated) {
        this.po.set(updated);
        await this.addHistoryRecord(
          'invoicing',
          this.translate.instant('purchaseOrderEntry.history.step.invoicing'),
          '',
          'INVOICED',
          {
            invoiceNumber: this.invoiceNumber(),
            invoiceDate: this.invoiceDate(),
            total: po.total || 0
          }
        );
        this.currentStep.set('history');
      }
    } catch (err) {
      console.error('Error invoicing purchase order:', err);
    } finally {
      this.submitting.set(false);
    }
  }

  async loadInvoiceNumber(): Promise<void> {
    try {
      const response = await firstValueFrom(this.poService.getNextInvoiceNumber());
      if (response && response.invoiceNumber) {
        this.invoiceNumber.set(response.invoiceNumber);
        if (!this.invoiceDate()) {
          const today = new Date().toISOString().split('T')[0];
          this.invoiceDate.set(today);
        }
      }
    } catch (err) {
      console.error('Error loading invoice number:', err);
    }
  }

  async handleAddHistoryNote(): Promise<void> {
    const po = this.po();
    if (!po || !po.id) return;

    const note = this.historyNote();
    if (!note.trim()) return;

    try {
      this.submitting.set(true);
      const updatedNotes = po.notes ? `${po.notes}\n\n${note}` : note;
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          notes: updatedNotes
        })
      );
      if (updated) {
        this.po.set(updated);
        await this.addHistoryRecord(
          'note',
          this.translate.instant('purchaseOrderEntry.history.step.note'),
          note,
          po.status
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
    const po = this.po();
    if (!po || !po.id) return;

    try {
      const jsonData = po.jsonData || {};
      const history = jsonData.history || [];
      const newRecord = {
        step,
        stepLabel,
        timestamp: new Date().toISOString(),
        notes,
        status: status || po.status,
        data
      };
      jsonData.history = [...history, newRecord];
      
      const updated = await firstValueFrom(
        this.poService.updatePurchaseOrder(po.id, {
          ...po,
          jsonData
        })
      );
      if (updated) {
        this.po.set(updated);
      }
    } catch (err) {
      console.error('Error adding history record:', err);
    }
  }

  hasDataKeys(data?: Record<string, any>): boolean {
    return !!(data && Object.keys(data).length > 0);
  }

  toString(value: string | number | symbol): string {
    return String(value);
  }

  getDataKeyLabel(key: string): string {
    return `purchaseOrderEntry.history.data.${key}`;
  }

  formatDataValue(key: string, value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    return String(value);
  }
}

