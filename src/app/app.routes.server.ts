import { RenderMode, ServerRoute } from '@angular/ssr';

const getProductIds = async () => {
  try {
    console.log('get prodic t ios');
    
    const res = await fetch('https://shoppyness-backend.onrender.com/api/v1/products');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const products = await res.json();
    return products.map((product: any) => ({ id: product.id.toString() }));
  } catch (error) {
    console.error('Failed to fetch products for prerender:', error);
    return []; // Return empty to skip prerendering dynamic routes
  }
};
export const serverRoutes: ServerRoute[] = [

  {
     path: 'product/:id',
     renderMode: RenderMode.Prerender,
     getPrerenderParams: () => getProductIds()
    
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
