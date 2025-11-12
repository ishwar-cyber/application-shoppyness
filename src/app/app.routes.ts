import { Routes } from '@angular/router';
import { authGuard } from './commons/gaurds/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    },
    {
        path:'products',
        loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductList)
    },
    {
        path:'categories',
        loadComponent: () => import('./pages/categories/categories').then(m => m.Categories)
    },
    {
        path:'product/:slug',
        loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail)
    },
    {
        path:'cart',
        loadComponent: () => import('./pages/cart/cart').then(m => m.Cart),
    },
    {
        path:'checkout',
        loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout), canActivate: [authGuard],
    },
    {
        path:'profile', loadComponent:() =>import ('./components/profile/profile').then(m=> m.Profile), canActivate:[authGuard]
    },
    {
        path:'login',
        loadComponent: () => import('./components/login/login').then(m => m.Login)
    },
    {
        path: 'payment-status',
        loadComponent: () => import('./components/payment-status/payment-status').then(m => m.PaymentStatus)
    },
    {
        path: 'order-success',
        loadComponent: () => import('./components/order-success/order-success').then(m => m.OrderSuccess)
    },
    {
        path: 'order-tracking',
        loadComponent: () => import('./components/order-details/order-details').then(m => m.OrderDetails)
    },
    {
        path: '**',
        loadComponent: () => import('./pages/home/home').then(m => m.Home)
    }
]
