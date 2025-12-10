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
import { Vendor } from '../../models/vendor.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-vendor-list',
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
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.scss']
})
export class VendorListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['vendorNumber', 'companyName', 'lastName', 'firstName', 'email', 'phone', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private vendorService = inject(VendorService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  vendors = this.store.select('vendors');

  ngOnInit(): void {
    this.loadVendors();
    this.updateColumnOrder();
    
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(() => {
        this.updateColumnOrder();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateColumnOrder(): void {
    if (this.languageService.isEnglish()) {
      this.displayedColumns.set(['vendorNumber', 'companyName', 'firstName', 'lastName', 'email', 'phone', 'jsonData', 'actions']);
    } else {
      this.displayedColumns.set(['vendorNumber', 'companyName', 'lastName', 'firstName', 'email', 'phone', 'jsonData', 'actions']);
    }
  }

  loadVendors(): void {
    this.vendorService.loadVendors(this.isLoading);
  }

  openAddVendorDialog(): void {
    this.vendorService.openAddVendorDialog(this.isLoading);
  }

  openEditVendorDialog(vendor: Vendor): void {
    this.vendorService.openEditVendorDialog(vendor, this.isLoading);
  }

  deleteVendor(vendor: Vendor): void {
    this.vendorService.openDeleteVendorDialog(vendor, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}

