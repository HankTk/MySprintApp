import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxTableComponent, AxCardComponent, MatCardModule } from '@ui/components';

interface SampleData
{
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-table-page',
  standalone: true,
  imports: [CommonModule, AxTableComponent, AxCardComponent, MatCardModule],
  templateUrl: './table-page.component.html',
  styleUrls: ['./table-page.component.scss']
})
export class TablePageComponent
{
  dataSource: SampleData[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'Active' },
    { id: 7, name: 'Edward Norton', email: 'edward@example.com', role: 'User', status: 'Inactive' },
    { id: 8, name: 'Fiona Apple', email: 'fiona@example.com', role: 'Manager', status: 'Active' },
    { id: 9, name: 'George Clooney', email: 'george@example.com', role: 'User', status: 'Active' },
    { id: 10, name: 'Helen Mirren', email: 'helen@example.com', role: 'Admin', status: 'Active' }
  ];

  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status'];
}

