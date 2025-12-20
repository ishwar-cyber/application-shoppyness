import { createReducer, on, State } from "@ngrx/store";
import * as ProductsActions from './products.actions'
import { initialProductState } from "./products.state";

export const productReducer = createReducer(
    initialProductState,

    on(ProductsActions.loadProducts, state =>({
        ...state,
        loading: true
    })),

    on(ProductsActions.loadProductsSuccess, (state,{products}) =>({
        ...state,
        loading: false,
        products
    })),

    on(ProductsActions.loadProductsFailure,(state,{error})=>({
        ...state,
        loading: false,
        error
    }))
)