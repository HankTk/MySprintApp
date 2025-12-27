import {
  Component,
  OnInit,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  AfterViewInit,
  effect
} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, CurrencyPipe} from '@angular/common';
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
import {AxTooltipDirective} from '@ui/components';
import {StoreService} from '../../../../core/store.service';
import {RMA} from '../../models/rma.model';
import {TranslateModule} from '@ngx-translate/core';
import {LanguageService} from '../../../../shared/services/language.service';
import {Subscription} from 'rxjs';
import {JsonUtil} from '../../../../shared/utils/json.util';
import {RMAService} from '../../services/rma.service';

@Component({
  selector: 'app-rma-list',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
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
  templateUrl: './rma-list.component.html',
  styleUrls: ['./rma-list.component.scss']
})
export class RMAListComponent implements OnInit, OnDestroy, AfterViewInit
{
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['rmaNumber', 'orderNumber', 'customerName', 'rmaDate', 'status', 'total', 'actions']);
  showFilters = signal<boolean>(false);
  showFilterValue = false; // Regular property for @Input binding

  // Table-level flag: whether the table supports filtering
  tableFilterable = true;

  // Column definitions for the new ax-table
  columns = signal<AxTableColumnDef<RMA>[]>([]);

  // Template references for custom cells
  @ViewChild('rmaDateCell') rmaDateCellTemplate?: TemplateRef<any>;
  @ViewChild('totalCell') totalCellTemplate?: TemplateRef<any>;

  @ViewChild('actionsCell') actionsCellTemplate?: TemplateRef<any>;

  // Reference to the table component
  @ViewChild('axTable') axTable?: AxTableComponent<RMA>;

  private store = inject(StoreService);
  private rmaService = inject(RMAService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  rmas = this.store.select('rmas');

  constructor()
  {
    // Reinitialize columns when rmas change (using effect)
    effect(() =>
    {
      // Access signal to create dependency
      this.rmas();
      // Reinitialize columns if templates are available

    });
  }

  ngOnInit(): void
  {
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
        key: 'rmaDate',
        header: this.languageService.instant('rmaDate'),
        field: 'rmaDate',
        sortable: true,
        filterable: true,
        filterType: 'date-range',
        cellTemplate: this.rmaDateCellTemplate
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
        key: 'total',
        header: this.languageService.instant('total'),
        field: 'total',
        sortable: true,
        filterable: true,
        filterType: 'text',
        align: 'right',
        cellTemplate: this.totalCellTemplate,
        formatter: (value) => (value || 0).toString()
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

  loadRMAs(): void
  {
    this.rmaService.loadRMAs(this.isLoading);
  }

  openAddRMADialog(): void
  {
    this.rmaService.openAddRMAEntry(this.isLoading);
  }

  openEditRMADialog(rma: RMA): void
  {
    this.rmaService.openEditRMAEntry(rma, this.isLoading);
  }

  deleteRMA(rma: RMA): void
  {
    this.rmaService.openDeleteRMADialog(rma, this.isLoading);
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

