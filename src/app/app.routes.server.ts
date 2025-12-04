import { RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';

// Helper: safe JSON fetch
const safeFetchJson = async (url: string) => {
   try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed fetching ${url} - ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('prerender fetch error', err);
    return null;
  }
};

// Fetch product slugs for prerender (kept for compatibility)
const getProductSlugs = async () => {
  const data = await safeFetchJson(`${environment.apiUrl}/products`);
  // Expecting an array of products or a wrapper { data: [...] }
  const list = data?.data || data || [];
  return (Array.isArray(list) ? list : []).map((p: any) => ({ slug: p.slug || p._id || p.id }));
};

// Fetch categories and subcategories for prerender params
const getCategoryPrerenderParams = async () => {
  const data = await safeFetchJson(`${environment.apiUrl}/category/header`);
  const cats = data?.category?.data || data?.data || data || [];
  const params: Record<string, string>[] = [];

  if (!Array.isArray(cats)) return params;

  for (const c of cats) {
    const catSlug = c?.slug || c?.name?.toString().toLowerCase().replace(/\s+/g, '-') || '';
    if (catSlug) params.push({ catSlug });

    const subs = c?.subcategories || c?.sub || c?.children || [];
    if (Array.isArray(subs)) {
      for (const s of subs) {
        const subSlug = s?.slug || s?.name?.toString().toLowerCase().replace(/\s+/g, '-') || '';
        if (subSlug) params.push({ catSlug, subSlug });
      }
    }
  }

  return params;
};

export const serverRoutes: ServerRoute[] = [

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

  // Fallback — serve remaining routes on the server
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
