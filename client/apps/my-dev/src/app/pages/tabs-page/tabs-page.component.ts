import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [CommonModule, AxCardComponent, MatCardModule, MatTabsModule],
  templateUrl: './tabs-page.component.html',
  styleUrls: ['./tabs-page.component.scss']
})
export class TabsPageComponent
{
  selectedIndex = 0;

  onTabChange(index: number): void
  {
    console.log('Tab changed to:', index);
  }
}
