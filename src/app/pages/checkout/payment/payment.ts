import { HttpClient } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { load } from '@cashfreepayments/cashfree-js';
import { CheckoutService } from '../../../services/payment';
@Component({
  selector: 'app-payment',
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {

  isProcessing = signal(false);
  amount = input.required<number>();
  private readonly paymentService = inject(CheckoutService);
  private readonly http = inject(HttpClient);
  private createOrder(amount: number) {
    const payload = {
      orderId: 'order_' + Date.now(),
      amount,
      customerName: 'Ishwar',
      customerPhone: '9876543210',
      customerEmail: 'ishwar@test.com',
    };
    this.paymentService.createOrder(payload).subscribe({
      next: () =>{
        
      }
    })
  }
  async pay(amount: number) {
    try {
      this.isProcessing.set(true);
      const order = await this.http.post<any>(
        'http://localhost:8000/api/v1/payment/create-order',
        {
          orderId: 'order_' + Date.now(),
          amount: 1,
          customerName: 'Ishwar',
          customerPhone: '9876543210',
          customerEmail: 'ishwar@test.com',
        }
      ).toPromise();
      // Step 1: Create order from backend
      // const order = await this.createOrder(amount);
      if (!order?.payment_session_id) {
        throw new Error('Invalid order response');
      }

      // Step 2: Load Cashfree SDK
    const cf = await load({ mode: "sandbox" });

    await cf.checkout({
      paymentSessionId: order.payment_session_id,
      onSuccess: (data: any) => {
        console.log("Payment success", data);
      },
      onFailure: (data: any) => {
        console.error("Payment failed", data);
      }
    });
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
