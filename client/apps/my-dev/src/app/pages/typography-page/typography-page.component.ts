import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  AxTitleComponent,
  AxSubtitleComponent,
  AxHeading3Component,
  AxHeadingComponent,
  AxSectionTitleComponent,
  AxParagraphComponent,
  AxCardComponent
} from '@ui/components';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-typography-page',
  standalone: true,
  imports: [
    CommonModule,
    AxTitleComponent,
    AxSubtitleComponent,
    AxHeading3Component,
    AxHeadingComponent,
    AxSectionTitleComponent,
    AxParagraphComponent,
    AxCardComponent,
    MatCardModule
  ],
  templateUrl: './typography-page.component.html',
  styleUrls: ['./typography-page.component.scss']
})
export class TypographyPageComponent
{
}
