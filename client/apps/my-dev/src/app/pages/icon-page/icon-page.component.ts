import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AxIconComponent, AxCardComponent, MatCardModule } from '@ui/components';

@Component({
  selector: 'app-icon-page',
  standalone: true,
  imports: [CommonModule, AxIconComponent, AxCardComponent, MatCardModule],
  templateUrl: './icon-page.component.html',
  styleUrls: ['./icon-page.component.scss']
})
export class IconPageComponent
{
  commonIcons = [
    'home', 'settings', 'person', 'search', 'menu', 'close', 'add', 'edit', 'delete', 'save',
    'check', 'arrow_back', 'arrow_forward', 'expand_more', 'expand_less', 'more_vert'
  ];

  actionIcons = [
    'add_circle', 'remove_circle', 'check_circle', 'cancel', 'refresh', 'download', 'upload',
    'print', 'share', 'bookmark', 'favorite', 'star', 'visibility', 'visibility_off'
  ];

  navigationIcons = [
    'chevron_left', 'chevron_right', 'first_page', 'last_page', 'navigate_before', 'navigate_next',
    'arrow_upward', 'arrow_downward', 'subdirectory_arrow_right', 'subdirectory_arrow_left'
  ];
}
