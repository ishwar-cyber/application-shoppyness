import { createFeatureSelector, createSelector } from "@ngrx/store";

import { ProductState } from "./products.state";


export const selectorProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(selectorProductState, s=>s.products);

export const selectProductLoading = createSelector(selectorProductState, s => s.loading);