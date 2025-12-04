import { CommonModule } from '@angular/common';
import { Component, input, ViewChild } from '@angular/core';
interface Image{
  url: string,
  product_id: string
}
interface Product {
  name: string,
  price: number,
  images?: Image,
  brand: string
}
@Component({
  selector: 'app-product-scroll',
  imports: [CommonModule],
  templateUrl: './product-scroll.html',
  styleUrls: ['./product-scroll.scss']
})
export class ProductScroll {
  // Default placeholder
  defaultImage = 'https://via.placeholder.com/200x150?text=Loading...';
  product = input<any | null>();

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage; // fallback to placeholder
  }
}
