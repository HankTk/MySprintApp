import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AxButtonComponent, AxCardComponent, MatCardModule} from '@ui/components';
import {DialogExampleComponent} from './dialog-example.component';

@Component({
  selector: 'app-dialog-page',
  standalone: true,
  imports: [CommonModule, AxButtonComponent, AxCardComponent, MatCardModule, MatDialogModule],
  templateUrl: './dialog-page.component.html',
  styleUrls: ['./dialog-page.component.scss']
})
export class DialogPageComponent
{
  private dialogRef: any = null;

  constructor(private dialog: MatDialog)
  {
  }

  openDialog(): void
  {
    // Close existing dialog if open
    if (this.dialogRef)
    {
      this.dialogRef.close();
    }
    this.dialogRef = this.dialog.open(DialogExampleComponent, {
      width: '500px',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'dialog-example-panel'
    });

    // Clear reference when dialog closes
    this.dialogRef.afterClosed().subscribe(() =>
    {
      this.dialogRef = null;
    });
  }

  openLargeDialog(): void
  {
    // Close existing dialog if open
    if (this.dialogRef)
    {
      this.dialogRef.close();
    }
    this.dialogRef = this.dialog.open(DialogExampleComponent, {
      width: '800px',
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'dialog-example-panel'
    });

    // Clear reference when dialog closes
    this.dialogRef.afterClosed().subscribe(() =>
    {
      this.dialogRef = null;
    });
  }
}

