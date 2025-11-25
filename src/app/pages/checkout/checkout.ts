import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Shipping } from './shipping/shipping';
import { Address, Billing } from './billing/billing';
import { Payment } from './payment/payment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';
import { OrderSuccess } from '../../components/order-success/order-success';
import { load } from '@cashfreepayments/cashfree-js';
import { single } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Shipping, Billing, OrderSuccess],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit{
 isLoading = signal(true);
  error = signal<string | null>(null);
  currentStep = signal(1);
  sameAsBilling = signal(false);
  cartItems = signal<any[]>([]);
  shipping = signal(0);
  selectedPaymentMethod = signal<string>('card');
  isProcessingPayment = signal(false);
  paymentError = signal<string | null>(null);
  isOrderComplete = signal(false);
  orderResponse = signal<any>(null);

  discount = signal<any>(0);
  couponCode = signal<any>(null);
  // Coupon state
  couponInput = signal<string>('');
  isCouponLoading = signal<boolean>(false);
  couponMessage = signal<string | null>(null);
  couponError = signal<boolean>(false);
  isProcessing = signal(false);

  selectedPaymentTab = signal<'card' | 'upi'>('card');
  subTotal = signal<number>(0);
  // Selected payment tab
  selectPaymentTab(tab: 'card' | 'upi') {
    this.selectedPaymentTab.set(tab);
  }
  private readonly checkoutService = inject(CheckoutService);
  public cartService = inject(CartService);
  totalAmount = signal<number>(this.cartService.subTotal());
    // State (signals)
  addressesList = signal<Address[]>([]);
  selectedAddress = signal<Address | null>(null);
  ngOnInit(): void {
    this.totalAmount.set(this.cartService.subTotal());
    this.subTotal.set(this.cartService.subTotal());
    this.cartItems.set(this.cartService.cartItems());
    this.loadCart();
  }
  
  setAddress(address: any) {
    this.selectedAddress.set(address);
  }
  private loadCart() {
    this.cartService.loadCart().subscribe({
      next: (items:any) => {
        this.cartItems.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load cart. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  nextStep() {
    if (this.currentStep() < 3) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }
  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  addAddress(newAddr: Address) {
    this.addressesList.update(list => [...list, newAddr]);
      this.selectedAddress.set(newAddr);
  }
 formatCurrency(amount: number | undefined | null): string {
  const value = Number(amount || 0);
  return '₹' + value.toLocaleString('en-IN');
}
  removeCoupon(code: string): void {
    this.isCouponLoading.set(true);
    
    this.cartService.removeCoupon(code).subscribe({
        next: () => {
          this.isCouponLoading.set(false);
          this.couponCode.set(null);
          this.couponInput.set('');
          this.couponMessage.set('Coupon removed');
          this.couponError.set(false);
          // this.loadCartItems(); // Refresh cart
        },
        error: (err) => {
          console.error('Error removing coupon:', err);
          this.isCouponLoading.set(false);
          this.couponError.set(true);
          this.couponMessage.set('Failed to remove coupon. Please try again.');
        }
      });
  }

  applyCoupon(): void {
    const code = this.couponInput();
    if (!code) {
      this.couponError.set(true);
      this.couponMessage.set('Please enter a valid coupon code to receive a discount');
      return;
    }
    this.isCouponLoading.set(true);
    this.couponError.set(false);
    this.couponMessage.set(null);
    this.cartService.applyCoupon(code)
      .subscribe({
        next: (response: any) => {
          this.couponCode.set(code);
          this.discount.set(response.discount);
          this.subTotal.set(response.cartTotal);
          this.totalAmount.set(response.finalTotal);
        }, error: (err) => {
          console.error('Error applying coupon:', err);
          this.couponError.set(true);
          this.couponMessage.set('Failed to apply coupon. Please try again.');
        }
      });
  }

  placeOrder() {
    if (this.isProcessing()) return; // Prevent multiple submissions
    this.isProcessing.set(true);
    this.error.set(null);
    if(this.cartService.cartItems().length===0){
      this.cartService.loadCart().subscribe({
        next: (items:any) => {
          this.cartItems.set(items);
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Failed to load cart. Please try again.');
          this.isLoading.set(false);
        },
      }); 
    }
    const orderPayload = {
      shippingAddress:  this.selectedAddress(),
      paymentMethod: 'online',
      items: this.cartService.cartItems() || this.cartItems(),
      totalAmount: this.totalAmount(),
      coupon: this.couponCode() || null
    };

    console.log('order payload', orderPayload);
    
    this.checkoutService.createOrder(orderPayload).subscribe({
      next: async (res: any) => {
        // this.isProcessing.set(false);
        // this.isOrderComplete.set(true);
        // setInterval(() => {
        //   this.isOrderComplete.set(false);
        //   this.router.navigate(['profile']);
        // }, 5000);
        // this.orderResponse.set(res);
     // Step 2: Initialize Cashfree checkout
      const cashfree = await load({ mode: "sandbox" }); // or "production"      
      cashfree.checkout({
        paymentSessionId: res.paymentSessionId, // from backend
        redirectTarget: "_self", // or _blank
      });
      },
      error: (err) => {
        console.error('Order placement failed:', err);
        this.error.set('Failed to place order. Please try again.');
        this.isProcessing.set(false);
      }
    }); 
  }
}
