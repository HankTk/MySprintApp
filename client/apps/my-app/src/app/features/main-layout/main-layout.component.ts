import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MenuDrawerComponent } from '../../shared/components/menu-drawer/menu-drawer.component';
import { SettingsDrawerComponent } from '../../shared/components/settings-drawer/settings-drawer.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LogoutConfirmDialogComponent } from '../../shared/components/logout-confirm-dialog/logout-confirm-dialog.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MenuDrawerComponent,
    SettingsDrawerComponent,
    TranslateModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  protected readonly title = 'Edge';
  
  @ViewChild('menuDrawer') menuDrawer!: MatSidenav;
  @ViewChild('settingsDrawer') settingsDrawer!: MatSidenav;
  
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  openMenuDrawer(): void {
    this.menuDrawer.open();
  }

  closeMenuDrawer(): void {
    this.menuDrawer.close();
  }

  openSettingsDrawer(): void {
    this.settingsDrawer.open();
  }

  closeSettingsDrawer(): void {
    this.settingsDrawer.close();
  }

  logout(): void {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // If logout is confirmed
        this.authService.logout();
      }
    });
  }
}
