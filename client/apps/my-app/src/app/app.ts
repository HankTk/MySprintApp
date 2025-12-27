import {Component, OnInit, inject} from '@angular/core';
import {RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {ThemeService} from './shared/services/theme.service';
import {AuthService} from './core/auth/auth.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TranslateModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit
{
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void
  {
    // Theme service will initialize automatically, but we ensure it's injected
  }
}
