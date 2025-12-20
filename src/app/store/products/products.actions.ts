import  {createAction, props } from '@ngrx/store';
export const loadProducts = createAction('[Products] load');

export const loadProductsSuccess = createAction('[Products] load success', props<{products: any[]}>());

export const loadProductsFailure = createAction('[Products] load failure', props<{error:string}>());
