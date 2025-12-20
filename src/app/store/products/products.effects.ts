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
      switchMap(() =>
        this.api.getProduct().pipe(
          map(products =>
            ProductsAction.loadProductsSuccess({ products })
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
