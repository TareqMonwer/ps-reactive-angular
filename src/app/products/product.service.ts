import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { catchError, combineLatest, map, Observable, tap, throwError, Subject, BehaviorSubject, merge, scan } from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';   
  private suppliersUrl = 'api/suppliers';
  private productSelectSubject = new BehaviorSubject<number>(1);
  productSelectAction$ = this.productSelectSubject.asObservable();
  private addProductSubject = new Subject<Product>();
  addProductAction$ = this.addProductSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );
  
  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) => {
      return products.map(product => ({
        ...product,
        price: product?.price ? product.price * 1.5 : 0,
        category: categories.find(c => product.categoryId === c.id)?.name,
        searchKey: [product.productName],
      } as Product))
    })
  )

  productsWithAddProducts$ = merge(
    this.productsWithCategory$,
    this.addProductAction$
  ).pipe(
    scan((acc, value) => 
    (value instanceof Array) ? [...value]:[...acc, value], [] as Product[])
  )
  
  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectAction$
  ]).pipe(
    map(([products, selectedProductId]) => 
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('behavior product: ', product))
  )
    
  constructor(private http: HttpClient,
    private productCategoryService: ProductCategoryService) { }

  selectedProductIdChanged(productId: number) {
    this.productSelectSubject.next(productId);
  }

  addNewProduct(product?: Product) {
    this.addProductSubject.next(
      product ? product : this.fakeProduct()
    )
  }
  
  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }

}
