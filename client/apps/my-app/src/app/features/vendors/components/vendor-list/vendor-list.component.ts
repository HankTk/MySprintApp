import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../../../core/store.service';
import { Vendor } from '../../models/vendor.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { VendorService } from '../../services/vendor.service';
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

@Component({
  selector: 'app-vendor-list',
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
