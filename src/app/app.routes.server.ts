import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'return-and-refund',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'shipping-policy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'help-center',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'terms-and-conditions',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contact-us',
    renderMode: RenderMode.Prerender
  },
  // PRERENDER product detail pages (if you prefer not to prerender these,
  // change `renderMode` to `RenderMode.Server`)
  {
    path: 'product/:slug',
    renderMode: RenderMode.Server
  },

  // PRERENDER category pages and subcategory pages
  {
    path: 'category/:catSlug',
    renderMode: RenderMode.Server
  },
  {
    path: 'category/:catSlug/:subSlug',
    renderMode: RenderMode.Server
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Client
  },
  {
    path: 'order-tracking',
    renderMode: RenderMode.Client
  },
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'my-account',
    renderMode: RenderMode.Client
  },

  // Fallback — serve remaining routes on the server
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
