import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AxButtonComponent, AxTooltipDirective, AxCardComponent, AxIconComponent, MatCardModule} from '@ui/components';

@Component({
  selector: 'app-tooltip-page',
  standalone: true,
  imports: [CommonModule, AxButtonComponent, AxTooltipDirective, AxCardComponent, AxIconComponent, MatCardModule],
  templateUrl: './tooltip-page.component.html',
  styleUrls: ['./tooltip-page.component.scss']
})
export class TooltipPageComponent
{
}
