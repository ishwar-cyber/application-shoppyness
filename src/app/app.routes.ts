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
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductList)
  },

  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then(m => m.Categories)
  },

  {
    path: 'product/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail)
  },

    // CATEGORY LIST PAGE
  {
    path: 'category/:catSlug',
    loadComponent: () =>
      import('./pages/category-product/category-product').then(m => m.CategoryProduct)
  },

  // SUBCATEGORY PAGE
  {
    path: 'category/:catSlug/:subSlug',
    loadComponent: () =>
      import('./pages/sub-category-product/sub-category-product').then(m => m.SubCategoryProduct)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.Cart)
  },

  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
    canActivate: [authGuard]
  },

  {
    path: 'my-account',
    loadComponent: () => import('./components/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },

  {
    path: 'login',
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
    path: 'forgot-password',
    loadComponent: () => import('./components/login/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },

  {
    path: 'orders',
    loadComponent: () => import('./components/my-order/my-order').then(m => m.MyOrder),
    canActivate: [authGuard]
  },

  {
    path: 'return-and-refund',
    loadComponent: () => import('./components/return-policy/return-policy').then(m => m.ReturnPolicy)
  },

  {
    path: 'about',
    loadComponent: () => import('./components/about/about').then(m => m.About)
  },

  {
    path: 'contact-us',
    loadComponent: () => import('./components/contact-us/contact-us').then(m => m.ContactUs)
  },

  {
    path: 'shipping-policy',
    loadComponent: () => import('./components/shipping/shipping').then(m => m.Shipping)
  },

  {
    path: 'terms-and-conditions',
    loadComponent: () => import('./components/terms-conditions/terms-conditions').then(m => m.TermsConditions)
  },

  {
    path: 'help-center',
    loadComponent: () => import('./components/help-center/help-center').then(m => m.HelpCenter)
  },

  {
    path: '**',
    redirectTo: ''
  }
];
