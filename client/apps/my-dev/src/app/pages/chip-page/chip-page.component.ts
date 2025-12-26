import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxChipComponent, AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-chip-page',
  standalone: true,
  imports: [CommonModule, AxChipComponent, AxCardComponent, MatCardModule],
  templateUrl: './chip-page.component.html',
  styleUrls: ['./chip-page.component.scss']
})
export class ChipPageComponent
{
  tags = ['Angular', 'TypeScript', 'Material', 'Components'];
  
  statusChips: { label: string; color: 'primary' | 'accent' | 'warn' }[] = [
    { label: 'Active', color: 'primary' },
    { label: 'Pending', color: 'accent' },
    { label: 'Error', color: 'warn' }
  ];

  onChipClick(chip: string): void
  {
    console.log('Chip clicked:', chip);
  }
}
