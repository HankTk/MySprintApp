import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MenuDrawerComponent } from '../../shared/components/menu-drawer/menu-drawer.component';
import { SettingsDrawerComponent } from '../../shared/components/settings-drawer/settings-drawer.component';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { LogoutConfirmDialogComponent } from '../../shared/components/logout-confirm-dialog/logout-confirm-dialog.component';
import { 
  AxToolbarComponent, 
  AxButtonComponent, 
  AxIconComponent 
} from '@ui/components';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MenuDrawerComponent,
    SettingsDrawerComponent,
    TranslateModule,
    AxToolbarComponent,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent
{
  protected readonly title = 'Edge';
  
  @ViewChild('menuDrawer') menuDrawer!: MatSidenav;
  @ViewChild('settingsDrawer') settingsDrawer!: MatSidenav;
  
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  openMenuDrawer(): void
  {
    this.menuDrawer.open();
  }

  closeMenuDrawer(): void
  {
    this.menuDrawer.close();
  }

  openSettingsDrawer(): void
  {
    this.settingsDrawer.open();
  }

  closeSettingsDrawer(): void
  {
    this.settingsDrawer.close();
  }

  logout(): void
  {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent,
    {
      width: '450px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result =>
    {
      if (result === true)
      {
        // Close all open dialogs before logging out
        this.dialog.closeAll();
        this.authService.logout();
      }
    });
  }
}
