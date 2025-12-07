import { Component, signal, ViewChild, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserManagementComponent } from './features/users/components/user-management/user-management.component';
import { MenuDrawerComponent } from './shared/components/menu-drawer/menu-drawer.component';
import { SettingsDrawerComponent } from './shared/components/settings-drawer/settings-drawer.component';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    UserManagementComponent,
    MenuDrawerComponent,
    SettingsDrawerComponent,
    TranslateModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit
{
  protected readonly title = signal('Edge');
  
  @ViewChild('menuDrawer') menuDrawer!: MatSidenav;
  @ViewChild('settingsDrawer') settingsDrawer!: MatSidenav;
  
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Theme service will initialize automatically, but we ensure it's injected
  }

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
}
