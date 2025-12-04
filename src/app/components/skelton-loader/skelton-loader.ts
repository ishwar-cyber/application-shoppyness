import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-skelton-loader',
  imports: [CommonModule],
  templateUrl: './skelton-loader.html',
  styleUrls: ['./skelton-loader.scss']
})
export class SkeltonLoader {
 // Number of skeleton cards
  skeletonCount = signal<number>(8);
}
