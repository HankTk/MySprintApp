import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxTextareaComponent, AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-textarea-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxTextareaComponent, AxCardComponent, MatCardModule],
  templateUrl: './textarea-page.component.html',
  styleUrls: ['./textarea-page.component.scss']
})
export class TextareaPageComponent {
  description = '';
  feedback = '';
  notes = 'This is some pre-filled content.';
}
