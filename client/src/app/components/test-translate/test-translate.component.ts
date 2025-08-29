import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-test-translate',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div>
      <h1>{{ 'test' | translate }}</h1>
      <p>{{ 'userManagementSystem' | translate }}</p>
    </div>
  `,
  styles: [`
    div {
      padding: 20px;
      border: 1px solid #ccc;
      margin: 20px;
    }
  `]
})
export class TestTranslateComponent
{
}



