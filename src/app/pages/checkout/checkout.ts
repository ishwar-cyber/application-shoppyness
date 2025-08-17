import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Shipping } from './shipping/shipping';
import { Billing } from './billing/billing';
import { Payment } from './payment/payment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, Shipping, Billing, Payment],
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
  paymentMethods = signal<string[]>(['card', 'upi', 'cod']);
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
  // Forms
  shippingForm!: FormGroup;
  billingForm!: FormGroup;
  paymentForm!: FormGroup;

  ngOnInit(): void {
     this.initForms();
    this.loadCart();
  }
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);
  public cartService = inject(CartService);

  private initForms() {
    this.shippingForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
    });

    this.billingForm = this.formBuilder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
    });

    this.paymentForm = this.formBuilder.group({
      cardNumber: [''],
      upiId: [''],
    });
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

  updateBillingForm() {
    if (this.sameAsBilling()) {
      this.billingForm.patchValue(this.shippingForm.value);
    }
  }

  toggleSameAsBilling() {
    this.sameAsBilling.set(!this.sameAsBilling());
    if (this.sameAsBilling()) {
      this.updateBillingForm();
    }
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

  selectPaymentMethod(method: any) {
    this.selectedPaymentMethod.set(method);
  }

  processPayment() {
    this.isProcessingPayment.set(true);
    this.paymentError.set(null);

    const payload = {
      shipping: this.shippingForm.value,
      billing: this.billingForm.value,
      payment: {
        method: this.selectedPaymentMethod(),
        ...this.paymentForm.value,
      },
      items: this.cartService.cartItems(),
      total:
        this.cartService.subTotal() +
        (this.selectedPaymentMethod() === 'cod' ? 50 : 0),
    };

    this.checkoutService.placeOrder(payload).subscribe({
      next: (res) => {
        this.isProcessingPayment.set(false);
        this.isOrderComplete.set(true);
        this.orderResponse.set(res);
      },
      error: (err) => {
        this.isProcessingPayment.set(false);
        this.paymentError.set(
          err.error?.message || 'Payment failed. Please try again.'
        );
      },
    });
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-IN');
  }

  /**
   * Remove the applied coupon from the cart
   */
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
   /**
   * Apply a coupon code to the cart
   * 
   * This method validates the entered coupon code and applies it to the cart.
   * Valid coupon codes will result in a discount being applied to the order.
   * For this demo, coupon validation happens locally for guest users and
   * via API for logged-in users.
   * 
   * Available demo coupons: WELCOME10, FLAT500, SUMMER25
   */
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
          this.isCouponLoading.set(false);
          
          if (response.success) {
            this.couponError.set(false);
            this.couponMessage.set(response.message);
            // this.loadCartItems(); // Refresh cart to reflect discount
          } else {
            this.couponError.set(true);
            this.couponMessage.set(response.message);
          }
        },
        error: (err) => {
          console.error('Error applying coupon:', err);
          this.isCouponLoading.set(false);
          this.couponError.set(true);
          this.couponMessage.set('Failed to apply coupon. Please try again.');
        }
      });
  }

}
