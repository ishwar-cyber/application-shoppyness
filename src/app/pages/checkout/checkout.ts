import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';
import { ProfileService } from '../../services/profile-service';
import { PopUp } from '../../components/pop-up/pop-up';
import { load } from '@cashfreepayments/cashfree-js';
import { PaymentService } from '../../services/payment';
import { Loader } from '../../components/loader/loader';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PopUp, Loader],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout implements OnInit{
  cartItems = signal<any[]>([]);
  totalAmount = signal<number>(0);
  subTotal = signal<number>(0);
  addressList = signal<any[]>([]);
  selectedAddressId = signal<string>('');
  couponInput = signal<string>('');
  paymentMethod = signal<string>('online');
  deliveryType = signal<string>('standard');

  isAddressModalOpen = signal<boolean>(false);
  couponCode = '';
  couponDiscount = signal<number>(0);
  isLoader = signal<boolean>(true);
  selectedAddress = computed(() => {
    return this.addressList().find(addr => addr._id === this.selectedAddressId());
  })
  couponError = signal<string | null>(null);
  couponSuccess = signal<string | null>(null);
  private readonly cartService = inject(CartService);
  private readonly profileService = inject(ProfileService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly paymentService = inject(PaymentService)
  private readonly router = inject(Router);
  public platformId = inject(PLATFORM_ID);
  addressForm!: FormGroup;
  // loader state
  isPlacingOrder = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  loadCart() {
    this.cartService.loadCart().subscribe((res: any) => {
      if(res.data.items.length === 0){
        this.router.navigate(['/cart']);
        // return false;
      }
      this.cartItems.set(res.data.items);

      this.totalAmount.set(res.data.total);
      this.subTotal.set(res.data.subTotal);
      this.isLoader.set(false);
    });
    this.buildAddressForm();
  }

  buildAddressForm() {
    this.addressForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      pincode: ['', Validators.required],
      line1: ['', Validators.required],
      line2: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India'],
    });
  }
  
  loadAddresses() {
    let id = sessionStorage.getItem('userId');
    id && this.profileService.getUserProfile(id).subscribe((res: any) => {
      this.addressList.set(res.data.addresses);
      if (res.data.addresses.length > 0) {
        this.selectedAddressId.set(res.data.addresses[0]._id);
      }
    });
    if (!id) {
      this.addressList.set([]);
    }
  }

  selectAddress(id: string) {
    this.selectedAddressId.set(id);
  }

  placeOrder() {
    if (!this.selectedAddressId()) {
      alert('Please select an address');
      return;
    }
    const orderPayload = this.createOrderPayload()
    this.checkoutService.createOrder(orderPayload).subscribe({
      next: (res: any) => {
        this.router.navigate([`/payment-success?orderId=${res.orderNumber}`]);
        // this.router.navigate(['/order-success'], {
        //   queryParams: { orderId: res?.orderId }
        // });
      },
      error: (err) => console.error(err)
    });
  } 
  
  createOrderPayload() {
    const orderPayload = {
      shippingAddress:  this.selectedAddress(),
      paymentMethod: this.paymentMethod(),
      items: this.cartService.cartItems() || this.cartItems(),
      totalAmount: this.totalAmount(),
      couponDiscount: this.couponDiscount() || null
    };
    return orderPayload;
  }

  async pay() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isPlacingOrder.set(true);
    try {
      /** ✅ Step 1: Create order */
      const order = await this.paymentService.createOrder(
        this.createOrderPayload()
      ).toPromise();

      if (!order?.payment_session_id) {
        throw new Error('Payment session not created');
      }

      /** ✅ Step 2: Open Cashfree Checkout */
      const cf = await load({ mode: 'sandbox' });

      await cf.checkout({
        paymentSessionId: order.payment_session_id,

        /** ✅ Payment success */
        onSuccess: async (data: any) => {
          await this.paymentService
            .verifyPayment(data.order.order_id)
            .toPromise();
          this.router.navigate(['/payment-success'], {
            queryParams: { orderId: data.order.order_id }
          });
        },

        /** ✅ Payment failure */
        onFailure: (err: any) => {
          this.router.navigate(['/payment-failed'], {
            queryParams: { reason: err.reason }
          });
        }
      });

    } catch (error) {
      this.isPlacingOrder.set(false);
      console.error('Payment Error:', error);
    }
  }
  applyCoupon() {
    if (!this.couponCode.trim()) {
      this.couponError.set('Please enter a coupon code.');
      this.couponSuccess.set(null);
      return;
    }

    if (this.couponCode) {
     this.cartService.applyCoupon(this.couponCode)
      .subscribe({
        next: (response: any) => {
          this.couponCode = this.couponCode;
          this.couponDiscount.set(response.discount);
          // this.subTotal.set(response.cartTotal);
          this.totalAmount.set(response.finalTotal);
          this.couponSuccess.set(`Coupon applied successfully! ₹ ${response.discount} discount added.`);
          this.couponError.set(null);
        }, error: (err) => {
          console.error('Error applying coupon:', err);
          this.couponError.set('Failed to apply coupon. Please try again.');
        }
      });
    } else {
      this.couponError.set('Invalid coupon code.');
      this.couponSuccess.set(null);
    }
  }
  
  async saveAddress() {
    if (this.addressForm.invalid) return;
    const userId = sessionStorage.getItem('userId') || '';
    const addressData = this.addressForm.value;
    this.checkoutService.updateAddress(userId, addressData).subscribe({
      next: (res: any) => {
        this.loadAddresses();
        this.isAddressModalOpen.set(false);
        this.addressForm.reset();
      },
      error: (err) => console.error(err)
    });
  }


  
}
