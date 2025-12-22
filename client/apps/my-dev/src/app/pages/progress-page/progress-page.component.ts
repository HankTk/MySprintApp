import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxProgressComponent, AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-progress-page',
  standalone: true,
  imports: [CommonModule, AxProgressComponent, AxCardComponent, MatCardModule],
  templateUrl: './progress-page.component.html',
  styleUrls: ['./progress-page.component.scss']
})
export class ProgressPageComponent implements OnInit, OnDestroy {
  progressValue = 0;
  private intervalId?: number;

  ngOnInit(): void {
    this.intervalId = window.setInterval(() => {
      this.progressValue = (this.progressValue >= 100) ? 0 : this.progressValue + 10;
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

