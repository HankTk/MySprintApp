import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxChartComponent, AxCardComponent, ChartConfig, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-chart-page',
  standalone: true,
  imports: [CommonModule, AxChartComponent, AxCardComponent, MatCardModule],
  templateUrl: './chart-page.component.html',
  styleUrls: ['./chart-page.component.scss']
})
export class ChartPageComponent {
  // Line Chart Configuration
  lineChartConfig: ChartConfig = {
    title: {
      text: 'Monthly Sales Data'
    },
    subtitle: {
      text: '2024 Sales Performance'
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      title: {
        text: 'Sales (in thousands)'
      }
    },
    series: [{
      name: 'Sales',
      data: [29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
      type: 'line'
    }],
    credits: {
      enabled: false
    }
  };

  // Bar Chart Configuration
  barChartConfig: ChartConfig = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Product Sales by Category'
    },
    xAxis: {
      categories: ['Electronics', 'Clothing', 'Food', 'Books', 'Toys']
    },
    yAxis: {
      title: {
        text: 'Sales Amount'
      }
    },
    series: [{
      name: 'Q1',
      data: [120, 80, 95, 60, 45]
    }, {
      name: 'Q2',
      data: [135, 90, 110, 70, 55]
    }, {
      name: 'Q3',
      data: [150, 100, 125, 80, 65]
    }],
    credits: {
      enabled: false
    }
  };

  // Pie Chart Configuration
  pieChartConfig: ChartConfig = {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Market Share by Region'
    },
    series: [{
      name: 'Share',
      data: [{
        name: 'North America',
        y: 35.0
      }, {
        name: 'Europe',
        y: 28.5
      }, {
        name: 'Asia',
        y: 22.3
      }, {
        name: 'South America',
        y: 8.5
      }, {
        name: 'Africa',
        y: 5.7
      }]
    }],
    credits: {
      enabled: false
    }
  };

  // Area Chart Configuration
  areaChartConfig: ChartConfig = {
    chart: {
      type: 'area'
    },
    title: {
      text: 'Revenue Over Time'
    },
    xAxis: {
      categories: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024']
    },
    yAxis: {
      title: {
        text: 'Revenue (millions)'
      }
    },
    series: [{
      name: 'Revenue',
      data: [2.5, 3.2, 3.8, 4.1, 4.5, 5.2]
    }],
    credits: {
      enabled: false
    }
  };

  // Multiple Series Line Chart
  multiLineChartConfig: ChartConfig = {
    title: {
      text: 'Yearly Comparison'
    },
    xAxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    yAxis: {
      title: {
        text: 'Value'
      }
    },
    series: [{
      name: '2023',
      data: [10, 15, 12, 18, 20, 22],
      type: 'line'
    }, {
      name: '2024',
      data: [12, 18, 15, 22, 25, 28],
      type: 'line'
    }],
    credits: {
      enabled: false
    }
  };
}
