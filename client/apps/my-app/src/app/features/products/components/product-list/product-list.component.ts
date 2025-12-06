import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Product list component
 * Displays a list of products
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  // TODO: Implement product list functionality
}
