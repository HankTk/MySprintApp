import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <div class="order-list-container">
      <mat-card class="main-card">
        <mat-card-header>
          <div class="header-content">
            <button mat-icon-button (click)="goBack()" aria-label="Go back" class="back-button">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <mat-card-title class="card-title">
              <mat-icon class="title-icon">shopping_cart</mat-icon>
              {{ 'menu.orders' | translate }}
            </mat-card-title>
          </div>
        </mat-card-header>
        <mat-card-content>
          <p>{{ 'orders.comingSoon' | translate }}</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .order-list-container {
      padding: var(--spacing-xl);
    }

    .main-card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .main-card mat-card-header {
      padding-top: 0 !important;
    }

    .header-content {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 16px 0;
      gap: 12px;
    }

    .back-button {
      flex-shrink: 0;
      color: var(--text-primary);
      background-color: rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color var(--transition-base);

      mat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }
    }

    :host-context(.dark-theme) .back-button {
      background-color: rgba(255, 255, 255, 0.04) !important;
    }

    :host-context(.dark-theme) .back-button:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
    }

    .card-title {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: 500;
      color: var(--accent-primary);
      margin: 0;
      flex: 1;
    }

    .title-icon {
      margin-right: 12px;
      font-size: 28px;
    }
  `]
})
export class OrderListComponent {
  private router = inject(Router);

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
