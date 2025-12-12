import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../users/models/user';
import { Subscription } from 'rxjs';

interface MenuItem {
  id: string;
  route: string;
  icon: string;
  labelKey: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  currentUser = signal<User | null>(null);
  welcomeMessage = signal<string>('');
  private langSubscription?: Subscription;

  menuItems: MenuItem[] = [
    { id: 'orders', route: '/orders', icon: 'shopping_cart', labelKey: 'menu.orders' },
    { id: 'inventory', route: '/inventory', icon: 'inventory', labelKey: 'menu.inventory' },
    { id: 'purchase-orders', route: '/purchase-orders', icon: 'receipt', labelKey: 'menu.purchaseOrders' },
    { id: 'rmas', route: '/rmas', icon: 'assignment_return', labelKey: 'menu.rmas' },
    { id: 'sfcs', route: '/sfcs', icon: 'factory', labelKey: 'menu.sfcs' },
    { id: 'general-ledger', route: '/general-ledger', icon: 'account_balance', labelKey: 'menu.generalLedger' },
    { id: 'accounts-receivable', route: '/account-receivable', icon: 'account_balance_wallet', labelKey: 'menu.accountsReceivable' },
    { id: 'accounts-payable', route: '/account-payable', icon: 'account_balance', labelKey: 'menu.accountsPayable' },
    // { id: 'master', route: '/master', icon: 'settings', labelKey: 'menu.master' }
  ];

  constructor() {
    // Watch for user changes
    effect(() => {
      const user = this.authService.currentUser();
      this.currentUser.set(user);
      this.updateWelcomeMessage();
    });
  }

  ngOnInit(): void {
    this.updateWelcomeMessage();
    
    // Subscribe to language changes
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateWelcomeMessage();
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
  }

  private updateWelcomeMessage(): void {
    const user = this.currentUser();
    const userName = user?.firstName || user?.userid || this.translate.instant('welcome.defaultUser');
    const message = this.translate.instant('welcome.message', { name: userName });
    this.welcomeMessage.set(message);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
