import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxButtonComponent } from '@ui/components';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [CommonModule, AxButtonComponent, MatCardModule, MatIconModule],
  templateUrl: './button-page.component.html',
  styleUrls: ['./button-page.component.scss']
})
export class ButtonPageComponent {

  isLoading = false;

  onLoadingClick(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

}

