import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';

interface OrderStatus {
  step: string;
  label: string;
  date?: string;
  completed: boolean;
}

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss'
})
export class OrderDetails {

  orderId = signal<string>('ORD-458793');
  orderDate = signal<string>('2025-11-09');
  estimatedDelivery = signal<string>('2025-11-15');

  // Tracking steps
  statuses = signal<OrderStatus[]>([
    { step: 'confirmed', label: 'Order Confirmed', date: 'Nov 09, 2025', completed: true },
    { step: 'packed', label: 'Packed', date: 'Nov 10, 2025', completed: true },
    { step: 'shipped', label: 'Shipped', date: 'Nov 11, 2025', completed: false },
    { step: 'out-for-delivery', label: 'Out for Delivery', completed: false },
    { step: 'delivered', label: 'Delivered', completed: false },
  ]);

  // Signal for progress
  progress = signal(0);

  constructor() {
    effect(() => {
      const total = this.statuses().length;
      const completed = this.statuses().filter(s => s.completed).length;
      this.progress.set(Math.round((completed / total) * 100));
    });
  }

  // Simulate updating progress
  advanceStep() {
    const list = this.statuses();
    const next = list.find(s => !s.completed);
    if (next) {
      next.completed = true;
      next.date = new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
      this.statuses.set([...list]);
    }
  }
}

