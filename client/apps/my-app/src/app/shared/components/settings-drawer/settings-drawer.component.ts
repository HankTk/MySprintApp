import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-settings-drawer',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    TranslateModule,
    LanguageSwitcherComponent
  ],
  templateUrl: './settings-drawer.component.html',
  styleUrls: ['./settings-drawer.component.scss']
})
export class SettingsDrawerComponent {
  @Output() closeDrawer = new EventEmitter<void>();
  
  private languageService = inject(LanguageService);

  onClose(): void {
    this.closeDrawer.emit();
  }
}
