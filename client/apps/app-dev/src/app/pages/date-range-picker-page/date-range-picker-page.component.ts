import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxDateRangePickerComponent } from '@ui/components';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-date-range-picker-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxDateRangePickerComponent, MatCardModule],
  templateUrl: './date-range-picker-page.component.html',
  styleUrls: ['./date-range-picker-page.component.scss']
})
export class DateRangePickerPageComponent {
  startDate: Date | null = null;
  endDate: Date | null = null;
}

