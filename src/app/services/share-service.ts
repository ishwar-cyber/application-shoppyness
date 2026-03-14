import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShareService {

 async openShare(product: any) {
    const url = `${location.origin}/product/${product.slug}`;

    // Native mobile share (best)
    // if (navigator.share) {
    //   navigator.share({
    //     title: product.name,
    //     text: `Check this product: ${product.name}`,
    //     url
    //   }).catch(() => { });
    //   return;
    // }
     if (!navigator.share) return;

    try {
      const imageUrl = product.images?.[0]?.url;

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const file = new File([blob], "product.jpg", {
        type: blob.type
      });

      await navigator.share({
        title: product.name,
        text: `Check this product: ${product.name}`,
        url: url,
        files: [file]
      });

    } catch (err) {
      console.log("Share failed", err);
    }
    // Desktop fallback
    const shareLinks = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(product.name)}%20${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(product.name)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(url)}`
    };
  }
}
