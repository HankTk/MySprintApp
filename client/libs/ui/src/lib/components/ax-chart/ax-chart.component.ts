import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

/**
 * Chart configuration interface
 */
export interface ChartConfig
{
  title?: {
    text?: string;
  };
  subtitle?: {
    text?: string;
  };
  xAxis?: {
    categories?: string[];
    title?: {
      text?: string;
    };
  };
  yAxis?: {
    title?: {
      text?: string;
    };
  };
  series?: any[];
  chart?: {
    type?: string;
  };
  plotOptions?: any;
  legend?: {
    enabled?: boolean;
  };
  credits?: {
    enabled?: boolean;
  };
  [key: string]: any;
}

/**
 * Reusable chart component using Highcharts
 * Provides a flexible wrapper around Highcharts for consistent chart styling
 */
@Component({
  selector: 'ax-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  templateUrl: './ax-chart.component.html',
  styleUrls: ['./ax-chart.component.scss']
})
export class AxChartComponent implements OnChanges
{
  @Input() config: ChartConfig = {};
  @Input() height?: number | string;
  @Input() width?: number | string;
  @Input() updateFlag = false;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: ChartConfig = {};

  ngOnChanges(changes: SimpleChanges): void
  {
    if (changes['config'] || changes['updateFlag'])
    {
      this.chartOptions = { ...this.config };
    }
  }
}
