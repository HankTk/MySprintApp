import { Component, OnInit, inject, OnDestroy, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './sfc-list.component.html',
  styleUrls: ['./sfc-list.component.scss']
})
export class SFCListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['sfcNumber', 'rmaNumber', 'orderNumber', 'customerName', 'status', 'assignedTo', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private sfcService = inject(SFCService);
  private rmaService = inject(RMAService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  sfcs = this.store.select('sfcs');
  rmas = this.store.select('rmas');
  processingRMA = signal<string | null>(null);

  // Find RMAs that need SFC creation (APPROVED or RECEIVED status, and no SFC exists)
  rmasNeedingSFC = computed(() => {
    const rmasList = this.rmas() || [];
    const sfcsList = this.sfcs() || [];
    
    return rmasList.filter((rma: RMA) => {
      if (rma.status !== 'APPROVED' && rma.status !== 'RECEIVED') return false;
      if (!rma.id) return false;
      // Check if SFC already exists for this RMA
      return !sfcsList.some((sfc: SFC) => sfc.rmaId === rma.id);
    });
  });

  ngOnInit(): void {
    this.loadSFCs();
    this.loadRMAs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSFCs(): void {
    this.sfcService.loadSFCs(this.isLoading);
  }

  loadRMAs(): void {
    this.rmaService.loadRMAs(this.isLoading);
  }

  async createSFCFromRMA(rma: RMA): Promise<void> {
    if (!rma.id) return;
    
    try {
      this.processingRMA.set(rma.id);
      const sfc = await firstValueFrom(this.sfcService.createSFCFromRMA(rma.id));
      // Reload data to show the new SFC
      this.loadSFCs();
      // Navigate to the SFC entry page
      if (sfc.id) {
        this.router.navigate(['/sfcs', sfc.id]);
      }
    } catch (err) {
      console.error('Error creating SFC from RMA:', err);
      alert('Failed to create SFC from RMA. Please try again.');
    } finally {
      this.processingRMA.set(null);
    }
  }

  openAddSFCDialog(): void {
    this.sfcService.openAddSFCEntry(this.isLoading);
  }

  openEditSFCDialog(sfc: SFC): void {
    this.sfcService.openEditSFCEntry(sfc, this.isLoading);
  }

  deleteSFC(sfc: SFC): void {
    this.sfcService.openDeleteSFCDialog(sfc, this.isLoading);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

