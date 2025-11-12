import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, effect, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../services/profile-service';
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
export class OrderDetails implements OnInit {

  orderId = signal<string>('ORD-458793');
  orderDate = signal<string>('2025-11-09');
  estimatedDelivery = signal<string>('2025-11-15');
  private readonly router = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
    isBrowser = false;

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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    effect(() => {
      const total = this.statuses().length;
      const completed = this.statuses().filter(s => s.completed).length;
      this.progress.set(Math.round((completed / total) * 100));
    });

    
  }
  ngOnInit(): void {
    if(!this.isBrowser) {
      return;
    }
    let userId = sessionStorage.getItem('userId') || '';
    console.log('isett', userId);
    
    this.router.queryParamMap.subscribe(params => {
      const id = params.get('orderId');
      if (id) {
        this.orderId.set(id);
        this.getOrderForTracking(userId, id);
      }
    });
  }

  getOrderForTracking(userId: string, orderId: string) {
    this.profileService.getOrderById(userId, orderId).subscribe((order: any) => {
      if (order) {
        console.log('order ', order);
        this.orderDate.set(new Date(order.date).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }));
        this.estimatedDelivery.set(new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }));
        this.statuses.set(order.statuses);
      }
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

