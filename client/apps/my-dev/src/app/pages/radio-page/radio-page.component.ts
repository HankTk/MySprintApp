import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AxRadioComponent, AxFormGroupComponent, AxCardComponent, MatCardModule} from '@ui/components';

@Component({
  selector: 'app-radio-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxRadioComponent, AxFormGroupComponent, AxCardComponent, MatCardModule],
  templateUrl: './radio-page.component.html',
  styleUrls: ['./radio-page.component.scss']
})
export class RadioPageComponent
{
  radioValue = 'option1';
  radioValue2 = 'option1';
}

