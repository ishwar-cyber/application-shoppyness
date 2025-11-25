import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, interval, takeUntil, firstValueFrom, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
export interface OrderStatusResponse {
  cart_details: any
  cf_order_id: string
  created_at: string
  customer_details: CustomerDetails
  entity: string
  order_amount: number
  order_currency: string
  order_expiry_time: string
  order_id: string
  order_meta: OrderMeta
  order_note: any
  order_splits: any[]
  order_status: string
  order_tags: any
  payment_session_id: string
  products: Products
  terminal_data: any
}

export interface CustomerDetails {
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_uid: any
}

export interface OrderMeta {
  notify_url: string
  payment_methods: any
  payment_methods_filters: any
  return_url: string
}

export interface Products {
  one_click_checkout: OneClickCheckout
  verify_pay: VerifyPay
}

export interface OneClickCheckout {
  enabled: boolean
  conditions: any[]
}

export interface VerifyPay {
  enabled: boolean
  conditions: any[]
}


@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-status.html',
  styleUrl: './payment-status.scss',
})
export class PaymentStatus implements OnInit {
  loading = signal(true);
  refreshing = signal(false);
  orderNotFound = signal(false);
  errorMsg = signal<string | null>(null);
  order = signal<OrderStatusResponse | null>(null);
  toast = signal<string | null>(null);
  orderId = signal<string | null>(null);
  status: 'pending' | 'success' | 'failed' = 'pending';
  intervalId: any;
  private stopPolling$ = new Subject<void>();
  // ✅ use env, works for local + production
  private apiBase = environment.apiUrl; // e.g. http://localhost:8000/api/v1
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    // Cashfree sends ?order_id=...
    this.orderId.set(this.route.snapshot.queryParamMap.get('order_id') || this.route.snapshot.paramMap.get('orderId'));
    this.pollStatus();
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  refresh(){
    this.refreshing.set(true);
    this.pollStatus();
  }
  pollStatus() {
  interval(3000)
    .pipe(
     
      switchMap(() => 
        this.http.get(`${this.apiBase}/payment/status/${this.orderId()}`)
      ),
       takeUntil(this.stopPolling$),
       takeUntilDestroyed(this.destroyRef),
    )
    .subscribe((res: any) => {
      if (!res.success) return;

      this.status = res.data.order_status;

      if ((res.data.order_status === 'PAID')  || (res.data.order_status === 'FAILED') || (res.data.order_status === 'ACTIVE')) {
        this.stopPolling$.next();
        this.stopPolling$.complete();

        this.order.set(res.data);
        this.loading.set(false);
        this.refreshing.set(false);
        // Stop polling
       
      }
    });
}
}


