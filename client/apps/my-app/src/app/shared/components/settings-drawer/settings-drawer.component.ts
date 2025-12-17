import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeSwitcherComponent } from '../theme-switcher/theme-switcher.component';
import { 
  AxButtonComponent, 
  AxIconComponent, 
  AxDividerComponent
} from '@ui/components';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-settings-drawer',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LanguageSwitcherComponent,
    ThemeSwitcherComponent,
    AxButtonComponent,
    AxIconComponent,
    AxDividerComponent,
    MatListModule
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
