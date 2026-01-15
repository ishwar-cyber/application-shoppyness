const fs = require('fs');
const path = require('path');
const API = 'https://shoppyness-backend.onrender.com/api/v1';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url} - ${res.status}`);
  return res.json();
}

(async () => {
  try {
    const pages = [
      '/',
      '/products',
      '/categories'
    ];

    const urls = [];

    for (const p of pages) urls.push({ loc: p, priority: '0.8' });

    // Fetch products
    let products = [];
    try { const p = await fetchJson(`${API}/products`); products = p?.data || p || []; } catch(e) { console.warn('Could not fetch products for sitemap', e); }
    products.forEach(prod => {
      const slug = prod.slug || prod.id || prod.id;
      if (slug) urls.push({ loc: `/product/${slug}`, priority: '0.9' });
    });

    // Fetch categories
    let cats = [];
    try { const c = await fetchJson(`${API}/category/header`); cats = c?.category?.data || c?.data || c || []; } catch(e) { console.warn('Could not fetch categories for sitemap', e); }
    cats.forEach(cat => {
      const catSlug = cat.slug || (cat.name||'').toString().toLowerCase().replace(/\s+/g,'-');
      if (catSlug) urls.push({ loc: `/category/${catSlug}`, priority: '0.8' });
      const subs = cat.subcategories || cat.sub || [];
      if (Array.isArray(subs)) subs.forEach(s => {
        const subSlug = s.slug || (s.name||'').toString().toLowerCase().replace(/\s+/g,'-');
        if (subSlug) urls.push({ loc: `/category/${catSlug}/${subSlug}`, priority: '0.8' });
      });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n${urls.map(u => `  <url>\n    <loc>https://yourdomain.com${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}\n</urlset>`;

    const outDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf8');
    console.log('sitemap.xml generated at public/sitemap.xml');
  } catch (err) {
    console.error('Failed to generate sitemap', err);
    process.exit(1);
  }
})();
