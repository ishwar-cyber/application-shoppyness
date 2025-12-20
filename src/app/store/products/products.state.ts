export interface ProductState {
    products: any[];
    loading: boolean;
    error: string | null;
}

export const initialProductState: ProductState = {
    products: [],
    loading: false,
    error: null
}