import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { Address } from '../../models/address.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-list',
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
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['addressType', 'streetAddress1', 'city', 'state', 'postalCode', 'country', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private addressService = inject(AddressService);
  private languageService = inject(LanguageService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  private subscriptions = new Subscription();

  JsonUtilRef = JsonUtil;

  addresses = this.store.select('addresses');

  ngOnInit(): void {
    this.loadAddresses();
    
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(() => {
        // Column order update if needed
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadAddresses(): void {
    this.addressService.loadAddresses(this.isLoading);
  }

  openAddAddressDialog(): void {
    this.addressService.openAddAddressDialog(this.isLoading);
  }

  openEditAddressDialog(address: Address): void {
    this.addressService.openEditAddressDialog(address, this.isLoading);
  }

  deleteAddress(address: Address): void {
    this.addressService.openDeleteAddressDialog(address, this.isLoading);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  getAddressTypeLabel(addressType?: string): string {
    if (!addressType) return '-';
    const key = addressType.toLowerCase();
    return this.translate.instant(key) || addressType;
  }
}

