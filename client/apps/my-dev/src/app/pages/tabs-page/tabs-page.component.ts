import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AxCardComponent, AxTabsComponent, AxTabPanel, MatCardModule} from '@ui/components';
import {UserInfoComponent} from './contents/user/user-info.component';
import {UserExperienceComponent} from './contents/user/user-experience.component';
import {UserSkillsComponent} from './contents/user/user-skills.component';
import {UserProjectsComponent} from './contents/user/user-projects.component';
import {ProductDescriptionComponent} from './contents/product/product-description.component';
import {ProductSpecificationsComponent} from './contents/product/product-specifications.component';
import {ProductReviewsComponent} from './contents/product/product-reviews.component';
import {ProductShippingComponent} from './contents/product/product-shipping.component';
import {DashboardOverviewComponent} from './contents/dashboard/dashboard-overview.component';
import {DashboardRevenueComponent} from './contents/dashboard/dashboard-revenue.component';
import {DashboardUsersComponent} from './contents/dashboard/dashboard-users.component';
import {DashboardSettingsComponent} from './contents/dashboard/dashboard-settings.component';

@Component({
  selector: 'app-tabs-page',
  standalone: true,
  imports: [CommonModule, AxCardComponent, AxTabsComponent, MatCardModule],
  templateUrl: './tabs-page.component.html',
  styleUrls: ['./tabs-page.component.scss']
})
export class TabsPageComponent
{
  userProfileTabs: AxTabPanel[] = [
    {
      label: 'Personal Info',
      component: UserInfoComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Work Experience',
      component: UserExperienceComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Skills',
      component: UserSkillsComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Projects',
      component: UserProjectsComponent,
      contentClass: 'tab-content'
    }
  ];

  productDetailsTabs: AxTabPanel[] = [
    {
      label: 'Description',
      component: ProductDescriptionComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Specifications',
      component: ProductSpecificationsComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Reviews',
      component: ProductReviewsComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Shipping',
      component: ProductShippingComponent,
      contentClass: 'tab-content'
    }
  ];

  dashboardTabs: AxTabPanel[] = [
    {
      label: 'Overview',
      component: DashboardOverviewComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Revenue',
      component: DashboardRevenueComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Users',
      component: DashboardUsersComponent,
      contentClass: 'tab-content'
    },
    {
      label: 'Settings',
      component: DashboardSettingsComponent,
      contentClass: 'tab-content'
    }
  ];

  selectedIndex = 0;

  onTabChange(index: number): void
  {
    console.log('Tab changed to:', index);
  }
}
