import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AxListboxComponent, ListboxOption, AxCardComponent, MatCardModule} from '@ui/components';

@Component({
  selector: 'app-listbox-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AxListboxComponent, AxCardComponent, MatCardModule],
  templateUrl: './listbox-page.component.html',
  styleUrls: ['./listbox-page.component.scss']
})
export class ListboxPageComponent
{
  singleValue = '';
  multipleValue: string[] = [];

  options: ListboxOption[] = [
    {value: 'option1', label: 'Option 1'},
    {value: 'option2', label: 'Option 2'},
    {value: 'option3', label: 'Option 3'},
    {value: 'option4', label: 'Option 4'},
    {value: 'option5', label: 'Option 5'}
  ];

  disabledOptions: ListboxOption[] = [
    {value: 'option1', label: 'Option 1'},
    {value: 'option2', label: 'Option 2', disabled: true},
    {value: 'option3', label: 'Option 3'},
    {value: 'option4', label: 'Option 4', disabled: true},
    {value: 'option5', label: 'Option 5'}
  ];
}

