import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxCardComponent } from '@ui/components';

@Component({
  selector: 'app-card-page',
  standalone: true,
  imports: [CommonModule, AxCardComponent],
  templateUrl: './card-page.component.html',
  styleUrls: ['./card-page.component.scss']
})
export class CardPageComponent {
}

