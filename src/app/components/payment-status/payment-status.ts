import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import e from 'express';
import { Subject, interval, takeUntil, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

interface OrderStatusResponse {
  orderId: string;
  status: 'pending' | 'success' | 'failed' | string;
  amount?: number;
  currency?: string;
  transactionId?: string | null;
  paymentMessage?: string | null;
  paymentTime?: string | null;
  paymentSessionId?: string | null; // when backend returns new session for retry
  // any other fields you want to surface
  items?: Array<{ productId?: string; name?: string; price?: number; quantity?: number; image?: string }>;
}
@Component({
  selector: 'app-payment-status',
  imports: [CommonModule],
  templateUrl: './payment-status.html',
  styleUrl: './payment-status.scss'
})
export class PaymentStatus implements OnInit, OnDestroy {

  // reactive UI state
  loading = signal(true);
  refreshing = signal(false);
  orderNotFound = signal(false);
  errorMsg = signal<string | null>(null);
  order = signal<OrderStatusResponse | null>(null);
  // simple toast message for small feedback
  toast = signal<string | null>(null);

  private destroy$ = new Subject<void>();
  private apiBase = `${environment.apiUrl}/payment`; // adjust to your backend

  // controls auto-polling attempts
  private maxPollAttempts = 6;
  private pollIntervalMs = 3000; // 3s
  private pollAttempts = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.queryParamMap.get('order_id') || this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      this.errorMsg.set('No order id found in URL.');
      this.loading.set(false);
      return;
    }

    // initial load
    this.loadOrderStatus(orderId, { fromInit: true });

    // start polling for final status (only when pending)
    interval(this.pollIntervalMs)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.order() || this.pollAttempts >= this.maxPollAttempts) return;
        if (this.order()!.status === 'pending' || this.order()!.status === 'active') {
          this.pollAttempts++;
          this.loadOrderStatus(orderId, { silent: true });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadOrderStatus(orderId: string, opts: { silent?: boolean; fromInit?: boolean } = {}) {
    if (!opts.silent) {
      this.loading.set(true);
      this.errorMsg.set(null);
    }

    try {
      const url = `${this.apiBase}/status/${encodeURIComponent(orderId)}`;
      const res = await firstValueFrom(this.http.get<OrderStatusResponse>(url));
      if (!res) {
        this.orderNotFound.set(true);
        this.errorMsg.set('Order not found');
        this.order.set(null);
      } else {
        this.order.set(res);
        this.orderNotFound.set(false);
        // clear toast after showing important update
        if (!opts.silent && res.status === 'success') this.toast.set('Payment successful 🎉');
      }
    } catch (err: any) {
      console.error('Load order status error', err);
      if (!opts.silent) this.errorMsg.set(err?.error?.message || 'Failed to load order status');
    } finally {
      if (!opts.silent) this.loading.set(false);
      this.refreshing.set(false);
    }
  }

  // manual refresh button handler
  async refresh() {
    const orderId = this.order()?.orderId ?? this.route.snapshot.queryParamMap.get('order_id');
    if (!orderId) return;
    this.refreshing.set(true);
    await this.loadOrderStatus(orderId, { silent: false });
    setTimeout(() => this.refreshing.set(false), 400);
  }

  // Retry payment -> ask backend to create a new payment session and return session id
  async retryPayment() {
    const orderId = this.order()?.orderId ?? this.route.snapshot.queryParamMap.get('order_id');
    if (!orderId) {
      this.toast.set('No order id to retry.');
      setTimeout(() => this.toast.set(null), 2500);
      return;
    }

    this.loading.set(true);
    try {
      // Backend endpoint should create a new Cashfree session and return paymentSessionId
      const res = await firstValueFrom(this.http.post<{ paymentSessionId?: string; paymentUrl?: string }>(
        `${this.apiBase}/retry/${encodeURIComponent(orderId)}`, {}
      ));

      // prefer SDK-based flow if session is provided
      if (res?.paymentSessionId) {
        // Attempt to use cashfree-js SDK if available
        try {
          // dynamic import so that projects that don't have SDK won't crash
          // To use SDK, install: npm i @cashfreepayments/cashfree-js
          const module = await import('@cashfreepayments/cashfree-js');
          const load = module.load as any;
          const cashfree = await load({ mode: 'sandbox' }); // or production depending on env
          cashfree.checkout({
            paymentSessionId: res.paymentSessionId,
            redirectTarget: '_self',
          });
          return;
        } catch (sdkErr) {
          // SDK not available — fallback to form POST using paymentSessionId
          console.warn('Cashfree SDK not found or failed to load, falling back to form POST.', sdkErr);
          this.openCheckoutWithForm(res.paymentSessionId);
          return;
        }
      } else if (res?.paymentUrl) {
        // if backend returns a direct payment URL (hosted), just redirect
        window.location.href = res.paymentUrl;
        return;
      } else {
        this.toast.set('Unable to get payment session from server.');
        setTimeout(() => this.toast.set(null), 3000);
      }
    } catch (err) {
      console.error('Retry payment error', err);
      this.toast.set('Retry failed. Try again later.');
      setTimeout(() => this.toast.set(null), 3000);
    } finally {
      this.loading.set(false);
    }
  }

  // fallback form submit (POST) for Cashfree checkout
  private openCheckoutWithForm(paymentSessionId?: string | null) {
    if (!paymentSessionId) {
      this.toast.set('Missing paymentSessionId for checkout.');
      setTimeout(() => this.toast.set(null), 2500);
      return;
    }

    const CASHFREE_CHECKOUT_POST = 'https://sandbox.cashfree.com/pg/checkout/post/submit'; // change to production URL when live
    const form = document.createElement('form');
    form.method = 'post';
    form.action = CASHFREE_CHECKOUT_POST;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payment_session_id'; // some Cashfree flows expect order_token/ payment_session_id. Adapt if needed.
    input.value = paymentSessionId;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  // small helper to format date/time friendly
  formatDate(dateStr?: string | null) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch {
      return dateStr;
    }
  }

  // navigate user to orders page or app home
  goToOrders() {
    this.router.navigate(['/orders']); // adjust route as per your app
  }
}
