import { Component, inject, Input, signal } from '@angular/core';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-share',
  imports: [],
  templateUrl: './product-share.html',
  styleUrl: './product-share.scss',
})
export class ProductShare {

  @Input() product!: {
    name: string;
    slug: string;
  };

  showOptions = signal<boolean>(false);

 public readonly shareService = inject(ProductService);

  share() {
    const url = `${location.origin}/product/${this.product.slug}`;

    const usedNative = this.shareService.shareProduct({
      title: this.product.name,
      text: `Check this product: ${this.product.name}`,
      url
    });
    if (!usedNative) {
      this.showOptions.set(true);
    }
  }

  get links() {
    const url = encodeURIComponent(
      `${location.origin}/product/${this.product.slug}`
    );
    const text = encodeURIComponent(this.product.name);

    return {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    };
  }

  copyLink() {
    navigator.clipboard.writeText(
      `${location.origin}/product/${this.product.slug}`
    );
    alert('Link copied!');
  }
}
