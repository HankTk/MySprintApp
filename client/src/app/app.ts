import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { DebugTranslateComponent } from './components/debug-translate/debug-translate.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserManagementComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('user-management-client');
}
