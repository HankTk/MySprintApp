import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav, MatDrawerMode } from '@angular/material/sidenav';

/**
 * Reusable sidenav/drawer component
 * Provides consistent sidenav styling across the application
 */
@Component({
  selector: 'ax-sidenav',
  standalone: true,
  imports: [CommonModule, MatSidenavModule],
  templateUrl: './ax-sidenav.component.html',
  styleUrls: ['./ax-sidenav.component.scss']
})
export class AxSidenavComponent {
  @ViewChild('sidenav') sidenav?: MatSidenav;
  
  @Input() mode: MatDrawerMode = 'side';
  @Input() position: 'start' | 'end' = 'start';
  @Input() opened = false;
  @Input() disableClose = false;
  @Input() fixedInViewport = false;
  @Input() fixedTopGap = 0;
  @Input() fixedBottomGap = 0;
  @Output() openedChange = new EventEmitter<boolean>();
  @Output() closedStart = new EventEmitter<void>();
  @Output() openedStart = new EventEmitter<void>();

  open(): void {
    this.sidenav?.open();
  }

  close(): void {
    this.sidenav?.close();
  }

  toggle(): void {
    this.sidenav?.toggle();
  }

  onOpenedChange(opened: boolean): void {
    this.openedChange.emit(opened);
  }

  onClosedStart(): void {
    this.closedStart.emit();
  }

  onOpenedStart(): void {
    this.openedStart.emit();
  }
}
