import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxCheckboxComponent, AxFormGroupComponent } from '@ui/components';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-checkbox-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxCheckboxComponent, AxFormGroupComponent, MatCardModule],
  templateUrl: './checkbox-page.component.html',
  styleUrls: ['./checkbox-page.component.scss']
})
export class CheckboxPageComponent {
  checkbox1 = false;
  checkbox2 = true;
  checkbox3 = false;
  checkbox4 = false;
}

