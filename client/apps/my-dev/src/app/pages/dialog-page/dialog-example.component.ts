import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-dialog-example',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-content">
      <h2>Example Dialog</h2>
      <p>This is an example dialog using Angular Material's MatDialog.</p>
      <p>You can add any content here.</p>
      <div class="dialog-actions">
        <button mat-button type="button" (click)="onClose()">Close</button>
        <button mat-raised-button color="primary" type="button" (click)="onSave()">Save</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-content {
      padding: 24px;
    }
    h2 {
      margin-top: 0;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
    }
  `]
})
export class DialogExampleComponent
{
  constructor(public dialogRef: MatDialogRef<DialogExampleComponent>)
  {
  }

  onClose(): void
  {
    this.dialogRef.close();
  }

  onSave(): void
  {
    console.log('Save clicked');
    this.dialogRef.close(true);
  }
}

