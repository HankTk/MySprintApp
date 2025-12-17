import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { 
  AxButtonComponent, 
  AxProgressComponent,
  AxCardComponent,
  AxIconComponent,
  AxTableComponent,
  MatTableModule,
  MatCardModule
} from '@ui/components';
import { AxTooltipDirective } from '@ui/components';
import { StoreService } from '../../../../core/store.service';
import { RMA } from '../../models/rma.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { RMAService } from '../../services/rma.service';

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
export class RMAListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['rmaNumber', 'orderNumber', 'customerName', 'rmaDate', 'status', 'total', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private rmaService = inject(RMAService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  rmas = this.store.select('rmas');

  ngOnInit(): void {
    this.loadRMAs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRMAs(): void {
    this.rmaService.loadRMAs(this.isLoading);
  }

  openAddRMADialog(): void {
    this.rmaService.openAddRMAEntry(this.isLoading);
  }

  openEditRMADialog(rma: RMA): void {
    this.rmaService.openEditRMAEntry(rma, this.isLoading);
  }

  deleteRMA(rma: RMA): void {
    this.rmaService.openDeleteRMADialog(rma, this.isLoading);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

