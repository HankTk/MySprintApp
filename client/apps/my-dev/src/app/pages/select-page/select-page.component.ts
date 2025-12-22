import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxSelectComponent, AxSelectOption, AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-select-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxSelectComponent, AxCardComponent, MatCardModule],
  templateUrl: './select-page.component.html',
  styleUrls: ['./select-page.component.scss']
})
export class SelectPageComponent {
  selectedValue: string = '';
  selectedCountry: string = '';

  options: AxSelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' }
  ];

  countries: AxSelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'jp', label: 'Japan' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' }
  ];

  disabledOptions: AxSelectOption[] = [
    { value: 'active1', label: 'Active Option 1' },
    { value: 'disabled1', label: 'Disabled Option', disabled: true },
    { value: 'active2', label: 'Active Option 2' },
    { value: 'disabled2', label: 'Another Disabled', disabled: true }
  ];
}
