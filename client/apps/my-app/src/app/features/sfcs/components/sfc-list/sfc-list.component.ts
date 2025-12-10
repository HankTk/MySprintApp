import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { SFCService } from '../../services/sfc.service';

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
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  sfcs = this.store.select('sfcs');

  ngOnInit(): void {
    this.loadSFCs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSFCs(): void {
    this.sfcService.loadSFCs(this.isLoading);
  }

  openAddSFCDialog(): void {
    this.sfcService.openAddSFCDialog(this.isLoading);
  }

  openEditSFCDialog(sfc: SFC): void {
    this.sfcService.openEditSFCDialog(sfc, this.isLoading);
  }

  deleteSFC(sfc: SFC): void {
    this.sfcService.openDeleteSFCDialog(sfc, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

