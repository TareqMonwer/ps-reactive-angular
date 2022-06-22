import { Component } from '@angular/core';

import { catchError, EMPTY } from 'rxjs';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProduct$ = this.productService.selectedProduct$;

  products$ = this.productService.productsWithCategory$
    .pipe(
      catchError(err => {
        this.errorMessage = err;
        return EMPTY
      })
    )

  constructor(private productService: ProductService) { }

  onSelected(productId: number): void {
    this.productService.selectedProductIdChanged(productId);
  }
}
