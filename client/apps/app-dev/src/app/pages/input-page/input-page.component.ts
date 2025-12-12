import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxInputComponent } from '@ui/components';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-input-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxInputComponent, MatCardModule],
  templateUrl: './input-page.component.html',
  styleUrls: ['./input-page.component.scss']
})
export class InputPageComponent {
  email = '';
  password = '';
  requiredField = '';
  disabledField = 'Disabled value';
  errorField = '';
  hintField = '';

  get hasError(): boolean {
    return this.errorField.length > 0 && this.errorField.length < 3;
  }
}

