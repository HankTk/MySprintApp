import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SFC, CreateSFCRequest } from '../../models/sfc.model';
import { RMA } from '../../../rmas/models/rma.model';
import { Customer } from '../../../customers/models/customer.model';
import { User } from '../../../users/models/user';
import { SFCService } from '../../services/sfc.service';
import { RMAService } from '../../../rmas/services/rma.service';
import { CustomerService } from '../../../customers/services/customer.service';
import { UserManagementService } from '../../../users/components/user-management/user-management.service';
import { StoreService } from '../../../../core/store.service';
import { SFCStep, EntrySubStep } from './types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sfc-entry',
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
  templateUrl: './sfc-entry.component.html',
  styleUrls: ['./sfc-entry.component.scss']
})
export class SFCEntryComponent implements OnInit
{
  currentStep = signal<SFCStep>('entry');
  currentEntrySubStep = signal<EntrySubStep>('rma');
  sfc = signal<SFC | null>(null);
  rmas = signal<RMA[]>([]);
  customers = signal<Customer[]>([]);
  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);

  // Assignment state
  assignedTo = signal<string | null>(null);
  notes = signal<string>('');

  // In Progress state
  startedDate = signal<Date | null>(null);

  // Completed state
  completedDate = signal<Date | null>(null);

  // History state
  historyNote = signal<string>('');
  
  // Computed signal for SFC history
  sfcHistory = computed(() =>
  {
    const sfc = this.sfc();
    if (!sfc?.jsonData?.history) return [];
    let history = sfc.jsonData.history;
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
  private sfcService = inject(SFCService);
  private rmaService = inject(RMAService);
  private customerService = inject(CustomerService);
  private userService = inject(UserManagementService);
  private store = inject(StoreService);
  private translate = inject(TranslateService);

  steps: { key: SFCStep; label: string }[] = [
    { key: 'entry', label: 'sfcEntry.step.entry' },
    { key: 'in_progress', label: 'sfcEntry.step.inProgress' },
    { key: 'completed', label: 'sfcEntry.step.completed' },
    { key: 'history', label: 'sfcEntry.step.history' }
  ];

  entrySubSteps: { key: EntrySubStep; label: string }[] = [
    { key: 'rma', label: 'sfcEntry.subStep.rma' },
    { key: 'assignment', label: 'sfcEntry.subStep.assignment' },
    { key: 'review', label: 'sfcEntry.subStep.review' }
  ];

  constructor()
  {
    // Watch for RMA store updates
    effect(() =>
    {
      const rmasFromStore = this.store.select('rmas')() || [];
      const processableRMAs = rmasFromStore.filter((r: RMA) => 
        (r.status === 'APPROVED' || r.status === 'RECEIVED')
      );
      if (processableRMAs.length > 0)
      {
        this.rmas.set(processableRMAs);
      }
    });

    // Watch for customer store updates
    effect(() =>
    {
      const customersFromStore = this.store.select('customers')() || [];
      if (customersFromStore.length > 0)
      {
        this.customers.set(customersFromStore);
      }
    });
  }

  async ngOnInit(): Promise<void> 
{
    const sfcId = this.route.snapshot.paramMap.get('id');
    
    // Load RMAs and customers first using services that update the store
    this.rmaService.loadRMAs(this.loading);
    this.customerService.loadCustomers(this.loading);
    await this.loadUsers();

    // Wait a bit for the store to be updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Load from store
    await this.loadRMAsFromStore();
    await this.loadCustomersFromStore();

    if (sfcId)
    {
      await this.loadSFC(sfcId);
    }
 else
 {
      await this.createNewSFC();
    }
  }

  private async createNewSFC(): Promise<void> 
{
    try 
{
      this.loading.set(true);
      const newSFC: Partial<SFC> =
      {
        status: 'PENDING',
      };
      const created = await firstValueFrom(this.sfcService.createSFC(newSFC as CreateSFCRequest));
      if (created && created.id)
      {
        this.sfc.set(created);
        // Wait a moment for the store to be updated
        await new Promise(resolve => setTimeout(resolve, 100));
      }
 else
 {
        console.error('SFC was created but has no ID');
        alert('Failed to create SFC. Please try again.');
      }
    }
 catch (err)
 {
      console.error('Error creating SFC:', err);
      alert('Failed to create SFC. Please try again.');
    }
 finally
 {
      this.loading.set(false);
    }
  }

  private async loadSFC(id: string): Promise<void> 
{
    try 
{
      this.loading.set(true);
      const sfc = await firstValueFrom(this.sfcService.getSFC(id));
      if (sfc)
      {
        this.sfc.set(sfc);
        this.assignedTo.set(sfc.assignedTo || null);
        this.notes.set(sfc.notes || '');
        if (sfc.startedDate)
        {
          this.startedDate.set(new Date(sfc.startedDate));
        }
        if (sfc.completedDate)
        {
          this.completedDate.set(new Date(sfc.completedDate));
        }
        // Set step based on SFC status
        this.setStepFromStatus(sfc.status);
      }
    }
 catch (err)
 {
      console.error('Error loading SFC:', err);
    }
 finally
 {
      this.loading.set(false);
    }
  }

  private setStepFromStatus(status?: string): void
 {
    const sfc = this.sfc();
    
    switch (status)
    {
      case 'PENDING':
        this.currentStep.set('entry');
        if (sfc?.rmaId)
        {
          if (sfc.assignedTo)
          {
            this.currentEntrySubStep.set('review');
          }
 else
 {
            this.currentEntrySubStep.set('assignment');
          }
        }
 else
 {
          this.currentEntrySubStep.set('rma');
        }
        break;
      case 'IN_PROGRESS':
        this.currentStep.set('in_progress');
        if (sfc?.startedDate)
        {
          this.startedDate.set(new Date(sfc.startedDate));
        }
        break;
      case 'COMPLETED':
        this.currentStep.set('history');
        if (sfc?.completedDate)
        {
          this.completedDate.set(new Date(sfc.completedDate));
        }
        break;
      default:
        this.currentStep.set('entry');
        this.currentEntrySubStep.set('rma');
    }
  }

  private async loadRMAsFromStore(): Promise<void> 
{
    try 
{
      const allRMAs = this.store.select('rmas')() || [];
      // Filter to only show RMAs that can be processed (APPROVED or RECEIVED status)
      // Also exclude RMAs that already have an SFC (unless we're editing an existing SFC)
      const processableRMAs = allRMAs.filter((r: RMA) => 
        (r.status === 'APPROVED' || r.status === 'RECEIVED')
      );
      this.rmas.set(processableRMAs);
    }
 catch (err)
 {
      console.error('Error loading RMAs from store:', err);
    }
  }

  private async loadCustomersFromStore(): Promise<void> 
{
    try 
{
      const customers = this.store.select('customers')() || [];
      this.customers.set(customers);
    }
 catch (err)
 {
      console.error('Error loading customers from store:', err);
    }
  }

  private async loadUsers(): Promise<void> 
{
    try 
{
      const users = await firstValueFrom(this.userService.getUsers());
      this.users.set(users);
    }
 catch (err)
 {
      console.error('Error loading users:', err);
    }
  }

  async onRMAChange(rmaId: string | null): Promise<void> 
{
    // Normalize null/empty values
    const normalizedRMAId = (rmaId && rmaId.trim() !== '') ? rmaId : null;
    
    // Get current SFC
    let sfc = this.sfc();
    
    // If SFC doesn't exist yet, wait for it to be created
    if (!sfc || !sfc.id)
    {
      let retries = 0;
      const maxRetries = 20; // Increase retries
      while ((!sfc || !sfc.id) && retries < maxRetries)
      {
        await new Promise(resolve => setTimeout(resolve, 200));
        sfc = this.sfc();
        retries++;
      }
      
      if (!sfc || !sfc.id)
      {
        console.error('SFC not available. Cannot update RMA.');
        alert('SFC is not ready yet. Please wait a moment and try again.');
        return;
      }
    }

    // If clearing RMA selection
    if (!normalizedRMAId)
    {
      try 
{
        this.loading.set(true);
        const updated = await firstValueFrom(
          this.sfcService.updateSFC(sfc.id, { 
            ...sfc, 
            rmaId: undefined, 
            rmaNumber: undefined,
            orderId: undefined,
            orderNumber: undefined,
            customerId: undefined,
            customerName: undefined
          })
        );
        if (updated)
        {
          this.sfc.set(updated);
        }
      }
 catch (err)
 {
        console.error('Error clearing RMA:', err);
        alert('Failed to clear RMA selection. Please try again.');
      }
 finally
 {
        this.loading.set(false);
      }
      return;
    }

    // Get RMA from store first (faster), fallback to API
    let rma: RMA | null = null;
    const rmasFromStore = this.store.select('rmas')() || [];
    rma = rmasFromStore.find((r: RMA) => r.id === normalizedRMAId) || null;
    
    if (!rma)
    {
      // Fallback to API call
      try 
{
        rma = await firstValueFrom(this.rmaService.getRMA(normalizedRMAId));
      }
 catch (err)
 {
        console.error('Error fetching RMA:', err);
        alert('Failed to load RMA details. Please try again.');
        return;
      }
    }

    if (!rma)
    {
      alert('RMA not found. Please select a different RMA.');
      return;
    }

    try 
{
      this.loading.set(true);
      const sfcToUpdate: SFC =
      {
        ...sfc, 
        rmaId: normalizedRMAId,
        rmaNumber: rma.rmaNumber,
        orderId: rma.orderId,
        orderNumber: rma.orderNumber,
        customerId: rma.customerId,
        customerName: rma.customerName
      };
      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, sfcToUpdate)
      );
      if (updated)
      {
        this.sfc.set(updated);
        // Move to next sub-step if RMA is selected
        if (this.currentEntrySubStep() === 'rma')
        {
          this.currentEntrySubStep.set('assignment');
        }
      }
    }
 catch (err)
 {
      console.error('Error updating RMA:', err);
      alert('Failed to update RMA. Please try again.');
    }
 finally
 {
      this.loading.set(false);
    }
  }

  async onAssignmentChange(assignedTo: string | null, notes: string): Promise<void> 
{
    const sfc = this.sfc();
    if (!sfc || !sfc.id)
    {
      return;
    }

    try 
{
      this.loading.set(true);
      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, {
          ...sfc,
          assignedTo: assignedTo || undefined,
          notes: notes || undefined
        })
      );
      if (updated)
      {
        this.sfc.set(updated);
        this.assignedTo.set(assignedTo);
        this.notes.set(notes);
      }
    }
 catch (err)
 {
      console.error('Error updating assignment:', err);
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
      const sfc = this.sfc();
      
      switch (subStep)
      {
        case 'rma':
          return !!sfc?.rmaId;
        case 'assignment':
          return !!sfc?.assignedTo;
        case 'review':
          return true;
        default:
          return false;
      }
    }
    
    switch (this.currentStep())
    {
      case 'in_progress':
        return !!this.startedDate();
      case 'completed':
        return !!this.completedDate();
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
    this.router.navigate(['/sfcs']);
  }

  async onStepClick(stepKey: SFCStep): Promise<void> 
{
    const isCompleted = this.isStepCompleted(stepKey);
    const isActive = this.currentStep() === stepKey;
    
    if (isCompleted || isActive)
    {
      const currentSFC = this.sfc();
      if (currentSFC?.id)
      {
        try 
{
          this.loading.set(true);
          const latestSFC = await firstValueFrom(this.sfcService.getSFC(currentSFC.id));
          if (latestSFC)
          {
            this.sfc.set(latestSFC);
            this.assignedTo.set(latestSFC.assignedTo || null);
            this.notes.set(latestSFC.notes || '');
            
            if (latestSFC.jsonData)
            {
              switch (stepKey)
              {
                case 'in_progress':
                  if (latestSFC.startedDate)
                  {
                    this.startedDate.set(new Date(latestSFC.startedDate));
                  }
                  break;
                case 'completed':
                  if (latestSFC.completedDate)
                  {
                    this.completedDate.set(new Date(latestSFC.completedDate));
                  }
                  break;
              }
            }
          }
        }
 catch (err)
 {
          console.error('Error reloading SFC:', err);
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

  isStepCompleted(step: SFCStep): boolean
  {
    const sfc = this.sfc();
    if (!sfc) return false;

    switch (step)
    {
      case 'entry':
        return !!(sfc.rmaId && sfc.assignedTo);
      case 'in_progress':
        return sfc.status === 'IN_PROGRESS' || sfc.status === 'COMPLETED';
      case 'completed':
        return sfc.status === 'COMPLETED';
      case 'history':
        return true;
      default:
        return false;
    }
  }

  isSubStepCompleted(subStep: EntrySubStep): boolean
  {
    const sfc = this.sfc();
    if (!sfc) return false;

    switch (subStep)
    {
      case 'rma':
        return !!sfc.rmaId;
      case 'assignment':
        return !!sfc.assignedTo;
      case 'review':
        return true;
      default:
        return false;
    }
  }

  getRMANumber(rmaId?: string): string
  {
    if (!rmaId) return '';
    const rma = this.rmas().find(r => r.id === rmaId);
    return rma?.rmaNumber || '';
  }

  getCustomerName(customerId?: string): string
  {
    if (!customerId) return '';
    const customer = this.customers().find(c => c.id === customerId);
    return customer?.companyName || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || '';
  }

  getUserName(userId?: string): string
  {
    if (!userId) return '';
    const user = this.users().find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  }

  getCurrentStepLabel(): string
  {
    const step = this.steps.find(s => s.key === this.currentStep());
    return step?.label || '';
  }

  async handleCompleteEntry(): Promise<void> 
{
    const sfc = this.sfc();
    if (!sfc || !sfc.id)
    {
      alert('SFC is not ready. Please wait a moment and try again.');
      return;
    }

    if (!sfc.rmaId)
    {
      alert('Please select an RMA before completing the entry.');
      this.currentEntrySubStep.set('rma');
      return;
    }
    if (!sfc.assignedTo)
    {
      alert('Please assign a user before completing the entry.');
      this.currentEntrySubStep.set('assignment');
      return;
    }

    try 
{
      this.submitting.set(true);
      const sfcToUpdate: SFC =
      {
        ...sfc,
        rmaId: sfc.rmaId,
        assignedTo: sfc.assignedTo,
        notes: this.notes(),
        status: 'PENDING'
      };
      
      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, sfcToUpdate)
      );
      if (updated)
      {
        this.sfc.set(updated);
        await this.addHistoryRecord(
          'entry',
          this.translate.instant('sfcEntry.history.step.entry'),
          '',
          'PENDING',
          {
            rmaId: sfc.rmaId,
            assignedTo: sfc.assignedTo
          }
        );
        this.currentStep.set('in_progress');
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

  async handleStartProcessing(): Promise<void> 
{
    const sfc = this.sfc();
    if (!sfc || !sfc.id) return;

    try 
{
      this.submitting.set(true);
      const jsonData = sfc.jsonData || {};
      const startedDateObj = this.startedDate() ? this.startedDate()!.toISOString() : undefined;
      jsonData.startedDate = startedDateObj ? startedDateObj.split('T')[0] : null;

      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, {
          ...sfc,
          status: 'IN_PROGRESS',
          startedDate: startedDateObj,
          jsonData
        })
      );
      if (updated)
      {
        this.sfc.set(updated);
        await this.addHistoryRecord(
          'in_progress',
          this.translate.instant('sfcEntry.history.step.inProgress'),
          '',
          'IN_PROGRESS',
          {
            startedDate: this.startedDate() ? this.startedDate()!.toISOString().split('T')[0] : null
          }
        );
        this.currentStep.set('completed');
      }
    }
 catch (err)
    {
      console.error('Error starting processing:', err);
    }
 finally
    {
      this.submitting.set(false);
    }
  }

  async handleCompleteProcessing(): Promise<void>
  {
    const sfc = this.sfc();
    if (!sfc || !sfc.id) return;

    try 
{
      this.submitting.set(true);
      const jsonData = sfc.jsonData || {};
      const completedDateObj = this.completedDate() ? this.completedDate()!.toISOString() : undefined;
      jsonData.completedDate = completedDateObj ? completedDateObj.split('T')[0] : null;

      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, {
          ...sfc,
          status: 'COMPLETED',
          completedDate: completedDateObj,
          jsonData
        })
      );
      if (updated)
      {
        this.sfc.set(updated);
        await this.addHistoryRecord(
          'completed',
          this.translate.instant('sfcEntry.history.step.completed'),
          '',
          'COMPLETED',
          {
            completedDate: this.completedDate() ? this.completedDate()!.toISOString().split('T')[0] : null
          }
        );
        this.currentStep.set('history');
      }
    }
 catch (err)
    {
      console.error('Error completing processing:', err);
    }
 finally
    {
      this.submitting.set(false);
    }
  }

  async handleAddHistoryNote(): Promise<void>
  {
    const sfc = this.sfc();
    if (!sfc || !sfc.id) return;

    const note = this.historyNote();
    if (!note.trim()) return;

    try 
{
      this.submitting.set(true);
      const updatedNotes = sfc.notes ? `${sfc.notes}\n\n${note}` : note;
      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, {
          ...sfc,
          notes: updatedNotes
        })
      );
      if (updated)
      {
        this.sfc.set(updated);
        await this.addHistoryRecord(
          'note',
          this.translate.instant('sfcEntry.history.step.note'),
          note,
          sfc.status
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
    const sfc = this.sfc();
    if (!sfc || !sfc.id) return;

    try 
{
      const jsonData = sfc.jsonData || {};
      const history = jsonData.history || [];
      const newRecord =
      {
        step,
        stepLabel,
        timestamp: new Date().toISOString(),
        notes,
        status: status || sfc.status,
        data
      };
      jsonData.history = [...history, newRecord];
      
      const updated = await firstValueFrom(
        this.sfcService.updateSFC(sfc.id, {
          ...sfc,
          jsonData
        })
      );
      if (updated)
      {
        this.sfc.set(updated);
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
    return `sfcEntry.history.data.${key}`;
  }

  formatDataValue(key: string, value: any): string
  {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    return String(value);
  }
}

