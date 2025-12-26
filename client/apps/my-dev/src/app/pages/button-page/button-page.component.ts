import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxButtonComponent, AxCardComponent, AxIconComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-button-page',
  standalone: true,
  imports: [CommonModule, AxButtonComponent, AxCardComponent, AxIconComponent, MatCardModule],
  templateUrl: './button-page.component.html',
  styleUrls: ['./button-page.component.scss']
})
export class ButtonPageComponent
{

  isLoading = false;

  onLoadingClick(): void
  {
    this.isLoading = true;
    setTimeout(() =>
    {
      this.isLoading = false;
    }, 2000);
  }

}

