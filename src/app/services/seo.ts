import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class Seo {
  private readonly meta = inject(Meta);
    private readonly title = inject(Title);
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Optional() @Inject(DOCUMENT) private readonly document: Document
  ) {}

  /**
   * Set page title and meta tags for SEO
   */
  updateMetaTags(config: {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
  }): void {
    // Set HTML title
    this.title.setTitle(config.title);

    // Update meta description
    this.meta.updateTag({ name: 'description', content: config.description });

    // Update keywords if provided
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Update Open Graph and Twitter meta tags
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
    }
    
    if (config.url) {
      this.meta.updateTag({ property: 'og:url', content: config.url });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      // Set canonical URL
      this.updateCanonicalUrl(config.url);
    }
    
    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
  }

  /**
   * Update canonical URL link element
   */
  private updateCanonicalUrl(url: string): void {
    // Only manipulate DOM in browser environment
    if (isPlatformBrowser(this.platformId) && this.document) {
      // Remove any existing canonical link
      const existingLink = this.document.querySelector('link[rel="canonical"]');
      if (existingLink) {
        existingLink.remove();
      }

      // Add the new canonical link
      const link: HTMLLinkElement = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  /**
   * Add or replace JSON-LD structured data in the document head
   */
  addStructuredData(jsonLd: object): void {
    if (!isPlatformBrowser(this.platformId) || !this.document) return;

    // Remove previous ld+json script if present
    const existing = this.document.querySelector('script[type="application/ld+json"][data-ngx-seo]');
    if (existing) existing.remove();

    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-ngx-seo', 'true');
    script.text = JSON.stringify(jsonLd);
    this.document.head.appendChild(script);
  }
}
