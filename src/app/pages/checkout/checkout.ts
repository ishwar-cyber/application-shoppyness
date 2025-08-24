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

  // Selected payment tab
  selectPaymentTab(tab: 'card' | 'upi') {
    this.selectedPaymentTab.set(tab);
  }
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly checkoutService = inject(CheckoutService);
  public cartService = inject(CartService);
  totalAmount = signal<number>(this.cartService.subTotal());

  selectedAddressId = signal<number | null>(1);
    // State (signals)
  addresses = signal<Address[]>([
    {
      id: 1,
      name: 'Rahul Sharma',
      phone: '9876543210',
      addressLine1: 'Flat 12B, Green View Apartments',
      addressLine2: 'Sector 21',
      landmark: 'Near HDFC Bank',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
  ]);
    // Useful derived state
  selectedAddress = computed(() =>
    this.addresses().find(a => a.id === this.selectedAddressId()!) || null
  );

  ngOnInit(): void {
    this.totalAmount.set(this.cartService.subTotal());
    this.loadCart();
  }
  



  setAddress(id: number) {
    this.selectedAddressId.set(id);
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
    this.addresses.update(list => [...list, newAddr]);
    this.selectedAddressId.set(newAddr.id);
  }
  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-IN');
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

  placeOrder() {
    if (this.isProcessing()) return; // Prevent multiple submissions
    this.isProcessing.set(true);
    this.error.set(null);
    const orderPayload = {
      shippingAddress: this.addresses().find(a => a.id === this.selectedAddressId()),
      paymentMethod: 'online',
      items: this.cartService.cartItems(),
      totalAmount: this.cartService.subTotal() + this.shipping(),
      coupon: this.couponCode() || null
    };
    this.checkoutService.createOrder(orderPayload).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        this.isOrderComplete.set(true);
        this.orderResponse.set(res);
      },
      error: (err) => {
        console.error('Order placement failed:', err);
        this.error.set('Failed to place order. Please try again.');
        this.isProcessing.set(false);
      }
    }); 
  }
}
