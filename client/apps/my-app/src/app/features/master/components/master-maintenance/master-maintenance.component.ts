import {Component, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule, MatTabChangeEvent} from '@angular/material/tabs';
import {TranslateModule} from '@ngx-translate/core';
import {
  AxButtonComponent,
  AxIconComponent
} from '@ui/components';

interface MaintenanceItem
{
  id: string;
  name: string;
  description: string;
  icon: string;
  action: () => void;
}

interface MaintenanceCategory
{
  id: string;
  name: string;
  nameKey: string;
  icon: string;
  items: MaintenanceItem[];
}

@Component({
  selector: 'app-master-maintenance',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    TranslateModule,
    AxButtonComponent,
    AxIconComponent
  ],
  templateUrl: './master-maintenance.component.html',
  styleUrls: ['./master-maintenance.component.scss']
})
export class MasterMaintenanceComponent
{
  private router = inject(Router);

  selectedCategory = signal<string>('data-management');

  selectedCategoryIndex = computed(() =>
  {
    const index = this.categories.findIndex(cat => cat.id === this.selectedCategory());
    return index >= 0 ? index : 0;
  });

  get selectedIndex(): number
  {
    return this.selectedCategoryIndex();
  }

  categories: MaintenanceCategory[] = [
    {
      id: 'data-management',
      name: 'Data Management',
      nameKey: 'master.maintenanceCategory.dataManagement',
      icon: 'storage',
      items: [
        {
          id: 'data-export',
          name: 'Data Export',
          description: 'Export master data to various formats',
          icon: 'download',
          action: () => this.exportData()
        },
        {
          id: 'data-import',
          name: 'Data Import',
          description: 'Import master data from files',
          icon: 'upload',
          action: () => this.importData()
        }
      ]
    },
    {
      id: 'backup-restore',
      name: 'Backup & Restore',
      nameKey: 'master.maintenanceCategory.backupRestore',
      icon: 'backup',
      items: [
        {
          id: 'data-backup',
          name: 'Data Backup',
          description: 'Create backup of master data',
          icon: 'backup',
          action: () => this.backupData()
        },
        {
          id: 'data-restore',
          name: 'Data Restore',
          description: 'Restore master data from backup',
          icon: 'restore',
          action: () => this.restoreData()
        }
      ]
    },
    {
      id: 'data-quality',
      name: 'Data Quality',
      nameKey: 'master.maintenanceCategory.dataQuality',
      icon: 'verified',
      items: [
        {
          id: 'data-cleanup',
          name: 'Data Cleanup',
          description: 'Clean up orphaned or invalid data',
          icon: 'cleaning_services',
          action: () => this.cleanupData()
        },
        {
          id: 'data-validation',
          name: 'Data Validation',
          description: 'Validate data integrity and consistency',
          icon: 'verified',
          action: () => this.validateData()
        }
      ]
    }
  ];

  onTabChange(event: MatTabChangeEvent | number): void
  {
    const index = typeof event === 'number' ? event : event.index;
    const category = this.categories[index];
    if (category)
    {
      this.selectedCategory.set(category.id);
    }
  }

  goBack(): void
  {
    this.router.navigate(['/master']);
  }

  exportData(): void
  {
    // TODO: Implement data export
    console.log('Export data');
  }

  importData(): void
  {
    // TODO: Implement data import
    console.log('Import data');
  }

  backupData(): void
  {
    // TODO: Implement data backup
    console.log('Backup data');
  }

  restoreData(): void
  {
    // TODO: Implement data restore
    console.log('Restore data');
  }

  cleanupData(): void
  {
    // TODO: Implement data cleanup
    console.log('Cleanup data');
  }

  validateData(): void
  {
    // TODO: Implement data validation
    console.log('Validate data');
  }
}

