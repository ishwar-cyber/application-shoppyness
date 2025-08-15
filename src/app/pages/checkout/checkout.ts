import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Shipping } from './shipping/shipping';
import { Billing } from './billing/billing';
import { Payment } from './payment/payment';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';

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

  // Forms
  shippingForm!: FormGroup;
  billingForm!: FormGroup;
  paymentForm!: FormGroup;

  // Computed Values
  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  tax = computed(() => Math.round(this.subtotal() * 0.18));
  total = computed(() => this.subtotal() + this.tax() + this.shipping());

  ngOnInit(): void {
     this.initForms();
    this.loadCart();
  }
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);

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
      items: this.cartItems(),
      total:
        this.total() +
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

}
