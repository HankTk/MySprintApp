import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService, Theme } from '../../services/theme.service';
import { 
  AxButtonComponent, 
  AxIconComponent
} from '@ui/components';
import { MatMenuModule } from '@angular/material/menu';
import { AxTooltipDirective } from '@ui/components';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent,
    MatMenuModule,
    AxTooltipDirective
  ],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss']
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  switchTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
