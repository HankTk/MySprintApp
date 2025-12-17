import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AxButtonComponent, AxCardComponent, MatCardModule } from '@ui/components';
import { DialogExampleComponent } from './dialog-example.component';

@Component({
  selector: 'app-dialog-page',
  standalone: true,
  imports: [CommonModule, AxButtonComponent, AxCardComponent, MatCardModule, MatDialogModule],
  templateUrl: './dialog-page.component.html',
  styleUrls: ['./dialog-page.component.scss']
})
export class DialogPageComponent {
  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(DialogExampleComponent, {
      width: '500px'
    });
  }

  openLargeDialog(): void {
    this.dialog.open(DialogExampleComponent, {
      width: '800px'
    });
  }
}

