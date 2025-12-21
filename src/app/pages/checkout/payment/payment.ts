import { HttpClient } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { load } from '@cashfreepayments/cashfree-js';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {

  amount = input.required<number>();
  isProcessing = signal(false);
  private http = inject(HttpClient);
  private router = inject(Router);
  createOrder(amount: number) {
    return this.http.post<any>(
      `${environment.apiUrl}/payment/create-order`,
      {
        orderId: 'order_' + Date.now(),
        amount,
        customerName: 'Ishwar',
        customerPhone: '9876543210',
        customerEmail: 'ishwar@test.com',
        returnUrl: `${environment.apiUrl}/payment-success`,
        notifyUrl: `${environment.apiUrl}/payment/webhook`
      }
    );
  }

  async pay() {
    this.isProcessing.set(true);
    try {
      const order = await this.createOrder(this.amount()).toPromise();
      if (!order?.payment_session_id) {
        throw new Error('Invalid payment session');
      }

      const cf = await load({ mode: 'sandbox' });

      await cf.checkout({
        paymentSessionId: order.payment_session_id,
        onSuccess: async (data: any) => {
          await this.http
            .post(`${environment.apiUrl}/payment/verify`, { orderId: data.order.order_id })
            .toPromise();

          this.router.navigate(['/payment-success'], {
            queryParams: { orderId: data.order.order_id }
          });
        },

        onFailure: (err: any) => {
          this.router.navigate(['/payment-failed'], {
            queryParams: { reason: err.reason }
          });
        }
      });

    } catch (error) {
      console.error("Payment Error:", error);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
