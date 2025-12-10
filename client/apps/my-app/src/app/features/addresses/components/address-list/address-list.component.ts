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
import { Address } from '../../models/address.model';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../../shared/services/language.service';
import { Subscription } from 'rxjs';
import { JsonUtil } from '../../../../shared/utils/json.util';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-address-list',
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
  templateUrl: './address-list.component.html',
  styleUrls: ['./address-list.component.scss']
})
export class AddressListComponent implements OnInit, OnDestroy {
  isLoading = signal<boolean>(false);
  displayedColumns = signal<string[]>(['customerId', 'addressType', 'streetAddress1', 'city', 'state', 'postalCode', 'country', 'jsonData', 'actions']);

  private store = inject(StoreService);
  private addressService = inject(AddressService);
  private languageService = inject(LanguageService);
  private router = inject(Router);

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
}

