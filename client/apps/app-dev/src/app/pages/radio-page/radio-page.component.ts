import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AxRadioComponent, AxFormGroupComponent } from '@ui/components';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxRadioComponent, AxFormGroupComponent, MatCardModule],
  templateUrl: './radio-page.component.html',
  styleUrls: ['./radio-page.component.scss']
})
export class RadioPageComponent {
  radioValue = 'option1';
  radioValue2 = 'option1';
}

