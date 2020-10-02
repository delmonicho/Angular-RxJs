import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, from, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, scan, shareReplay, switchMap, tap, toArray } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  // observable data stream to get and send products array
  products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  // observable data stream that combines products stream with categories to display products with categorical strings
  productsWithCategory$ = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(c => product.categoryId === c.id).name,
        searchKey: [product.productName]
      }) as Product)
    ),
    shareReplay(1)
  );

  // action stream to deal with selecting a product in alt-UI
  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable(); // expose the Subject as Observable

  selectedProduct$ = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ])
    .pipe(
      map(([products, selectedProductId]) =>
        products.find(product => product.id === selectedProductId)
      ),
      tap(product => console.log('selectedProduct', product)),
      shareReplay(1)
    );

  // action stream to deal with adding a new product 
  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  productsWithAdd$ = merge(
    this.productsWithCategory$,
    this.productInsertedAction$
  )
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value])
    );

    // get it all approach, grabs all suppliers connect to products and caches them 
    // selectedProductSuppliers$ = combineLatest([
    //   this.selectedProduct$,
    //   this.supplierService.suppliers$
    // ]).pipe(
    //   map(([selectedProduct, suppliers]) =>
    //     suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id))
    //   )
    // );

    // just in time approach, grabs suppliers associated with product at time of user selection
    // selectedProductSuppliers$ = this.selectedProduct$
    //   .pipe(
    //     filter(selectedProduct => Boolean(selectedProduct)),
    //     mergeMap(selectedProduct =>
    //       from(selectedProduct.supplierIds)
    //         .pipe(
    //           mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
    //           toArray(),
    //           tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers)))
    //         ))
    //   );

    // switchMap just in time
    selectedProductSuppliers$ = this.selectedProduct$
      .pipe(
        filter(selectedProduct => Boolean(selectedProduct)),
        switchMap(selectedProduct =>
          from(selectedProduct.supplierIds)
            .pipe(
              mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
              toArray(),
              tap(suppliers => console.log('product suppliers', JSON.stringify(suppliers)))
            ))
      );

  constructor(private http: HttpClient,
              private productCategoryService: ProductCategoryService,
              private supplierService: SupplierService) { }

  // select product service
  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  // add product service
  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();  // set mock product if newProduct is undefined or null
    this.productInsertedSubject.next(newProduct);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
