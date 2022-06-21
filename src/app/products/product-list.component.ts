import { ChangeDetectionStrategy, Component } from '@angular/core';

import { catchError, EMPTY, map, Subject, combineLatest } from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent  {
  pageTitle = 'Product List';
  errorMessage = '';
  private categorySubject = new Subject<number>();
  categorySelectAction$ = this.categorySubject.asObservable();

  products$ = combineLatest([
    this.productService.products$,
    this.categorySelectAction$
  ]).pipe(
    map(([products, categoryId]) =>
        products.filter(product =>
          categoryId ? product.categoryId === categoryId : true
      )),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  )

  categories$ = this.productCategoryService.productCategories$

  constructor(private productService: ProductService,
    private productCategoryService: ProductCategoryService) { }

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    this.categorySubject.next(+categoryId);
  }
}
