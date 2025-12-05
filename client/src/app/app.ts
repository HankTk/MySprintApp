import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserManagementComponent } from './features/users/components/user-management/user-management.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UserManagementComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App
{
  protected readonly title = signal('Edge');
}
