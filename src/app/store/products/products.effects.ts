import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import * as ProductsAction from './products.actions';
import { ProductService } from '../../services/product';

@Injectable()
export class ProductsEffect {

  private actions$ = inject(Actions);
  private api = inject(ProductService);
  
  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsAction.loadProducts),

      switchMap(({ page, limit }) =>
        this.api.getProduct(page, limit, undefined, undefined, undefined, undefined, undefined).pipe(

          map((res: any) =>
            ProductsAction.loadProductsSuccess({
              products: res.data,
              pagination: res.pagination
            })
          ),

          catchError(error =>
            of(
              ProductsAction.loadProductsFailure({
                error: error?.message || 'Failed to load'
              })
            )
          )
        )
      )
    )
  );
}