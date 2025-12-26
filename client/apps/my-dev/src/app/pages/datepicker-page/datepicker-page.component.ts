import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxDatepickerComponent, AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-datepicker-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxDatepickerComponent, AxCardComponent, MatCardModule],
  templateUrl: './datepicker-page.component.html',
  styleUrls: ['./datepicker-page.component.scss']
})
export class DatepickerPageComponent
{
  selectedDate: Date | null = null;
  birthDate: Date | null = null;
}
