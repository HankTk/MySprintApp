import { Component, OnInit, inject, OnDestroy, signal, computed, ViewChild, ChangeDetectorRef, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AxButtonComponent,
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  AxTableColumnDef,
  FilterOption,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';
import { StoreService } from '../../../../core/store.service';
import { SFC } from '../../models/sfc.model';
import { RMA } from '../../../rmas/models/rma.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { SFCService } from '../../services/sfc.service';
import { RMAService } from '../../../rmas/services/rma.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sfc-list',
  standalone: true,
  imports: [
    TranslateModule,
    AxButtonComponent,
    AxProgressComponent,
    AxCardComponent,
    AxIconComponent,
    AxTableComponent,
    MatTableModule,
    MatCardModule,
    AxTooltipDirective
  ],
  templateUrl: './sfc-list.component.html',
  styleUrls: ['./sfc-list.component.scss']
})
export class SFCListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['sfcNumber', 'rmaNumber', 'orderNumber', 'customerName', 'status', 'assignedTo', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<SFC>[]>([]);

  // Template references for custom cells

  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<SFC>;

  private store = inject(StoreService);
  private sfcService = inject(SFCService);
  private rmaService = inject(RMAService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  sfcs = this.store.select('sfcs');
  rmas = this.store.select('rmas');
  processingRMA = signal<string | null>(null);

  constructor()
  {
    // Reinitialize columns when sfcs change (using effect)
    effect(() =>
    {
      // Access signal to create dependency
      this.sfcs();
      // Reinitialize columns if templates are available

    });
  }

  // Find RMAs that need SFC creation (APPROVED or RECEIVED status, and no SFC exists)
  rmasNeedingSFC = computed(() =>
  {
    const rmasList = this.rmas() || [];
    const sfcsList = this.sfcs() || [];

    return rmasList.filter((rma: RMA) =>
    {
      if (rma.status !== 'APPROVED' && rma.status !== 'RECEIVED') return false;
      if (!rma.id) return false;
      // Check if SFC already exists for this RMA
      return !sfcsList.some((sfc: SFC) => sfc.rmaId === rma.id);
    });
  });

  ngOnInit(): void
  {
    this.loadSFCs();
    this.loadRMAs();
  }

  ngAfterViewInit(): void
  {
    // Initialize columns after view init so templates are available
    this.initializeColumns();
  }

  ngOnDestroy(): void
  {
    this.subscriptions.unsubscribe();
  }

  private initializeColumns(): void
 {
    this.columns.set([
      {
        key: 'sfcNumber',
        header: this.languageService.instant('sfcNumber'),
        field: 'sfcNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'rmaNumber',
        header: this.languageService.instant('rmaNumber'),
        field: 'rmaNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'orderNumber',
        header: this.languageService.instant('orderNumber'),
        field: 'orderNumber',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'customerName',
        header: this.languageService.instant('customerName'),
        field: 'customerName',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'status',
        header: this.languageService.instant('status'),
        field: 'status',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },
      {
        key: 'assignedTo',
        header: this.languageService.instant('assignedTo'),
        field: 'assignedTo',
        sortable: true,
        filterable: true,
        filterType: 'text',
        formatter: (value) => value || '-'
      },

      {
        key: 'actions',
        header: this.languageService.instant('actions'),
        field: 'id',
        sortable: false,
        filterable: false,
        cellTemplate: this.actionsCellTemplate
      }
    ]);
  }

  loadSFCs(): void
  {
    this.sfcService.loadSFCs(this.isLoading);
  }

  loadRMAs(): void
  {
    this.rmaService.loadRMAs(this.isLoading);
  }

  async createSFCFromRMA(rma: RMA): Promise<void> 
{
    if (!rma.id) return;

    try 
{
      this.processingRMA.set(rma.id);
      const sfc = await firstValueFrom(this.sfcService.createSFCFromRMA(rma.id));
      // Reload data to show the new SFC
      this.loadSFCs();
      // Navigate to the SFC entry page
      if (sfc.id)
      {
        this.router.navigate(['/sfcs', sfc.id]);
      }
    }
 catch (err)
 {
      console.error('Error creating SFC from RMA:', err);
      alert('Failed to create SFC from RMA. Please try again.');
    }
 finally
 {
      this.processingRMA.set(null);
    }
  }

  openAddSFCDialog(): void
  {
    this.sfcService.openAddSFCEntry(this.isLoading);
  }

  openEditSFCDialog(sfc: SFC): void
  {
    this.sfcService.openEditSFCEntry(sfc, this.isLoading);
  }

  deleteSFC(sfc: SFC): void
  {
    this.sfcService.openDeleteSFCDialog(sfc, this.isLoading);
  }

  goBack(): void
  {
    this.router.navigate(['/']);
  }

  clearTableFilters(): void
  {
    if (this.axTable)
    {
      this.axTable.clearFilters();
    }
  }

  getClearFiltersLabel(): string
  {
    const translated = this.languageService.instant('clearFilters');
    // If translation returns the key itself, it means the key wasn't found
    return translated && translated !== 'clearFilters' ? translated : 'Clear Filters';
  }

  toggleFilters(): void
  {
    const currentValue = this.showFilters();
    const newValue = !currentValue;

    // Update both signal and property
    this.showFilters.set(newValue);
    this.showFilterValue = newValue;

    // Force change detection to ensure the binding is updated
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }
}

