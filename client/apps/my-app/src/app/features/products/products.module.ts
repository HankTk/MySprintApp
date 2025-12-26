import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

/**
 * Products module
 * Feature module for product-related functionality
 * Note: This is optional in standalone Angular applications
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductListComponent,
    ProductDetailComponent
  ],
  exports: [
    ProductListComponent,
    ProductDetailComponent
  ]
})
export class ProductsModule
{
}