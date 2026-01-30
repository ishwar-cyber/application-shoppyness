import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';
import { ProfileService } from '../../services/profile-service';
import { PopUp } from '../../components/pop-up/pop-up';
import { load } from '@cashfreepayments/cashfree-js';
import { PaymentService } from '../../services/payment';
import { Loader } from '../../components/loader/loader';
import { firstValueFrom } from 'rxjs';
import { CreateOrder } from '../../commons/models/payments.model';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PopUp, Loader],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  couponCode = signal<string>('');
  couponDiscount = signal<number>(0);
  isLoader = signal<boolean>(true);
  selectedAddress = computed(() => {
    return this.addressList().find(addr => addr.id === this.selectedAddressId());
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
      // country: ['India'],
    });
  }
  
  loadAddresses() {
    let id = sessionStorage.getItem('userId');
    id && this.profileService.getUserProfile(id).subscribe((res: any) => {
      if(res.data){
        this.addressForm.patchValue({
          fullName: res.data.username || '',
          phone: res.data.phone || '',
          email: res.data.email || ''
        });
      }
      this.addressList.set(res.data.addresses);
      if (res.data.addresses.length > 0) {
        this.selectedAddressId.set(res.data.addresses[0].id);
      }
    });
    if (!id) {
      this.addressList.set([]);
    }
  }

  selectAddress(id: string) {
    this.selectedAddressId.set(id);
  }
createOrderPayload(): CreateOrder {
  return {
    shippingAddressId: this.selectedAddress()?.id,
    couponCode: this.couponCode() || null,
    items: (this.cartService.cartItems() || this.cartItems()).map(item => ({
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity || 1
    }))
  };
}

 async pay() {
  if (!isPlatformBrowser(this.platformId)) return;

  this.isPlacingOrder.set(true);

  try {
    /** 🔹 STEP 1: Create order (backend creates Cashfree order) */
    const order = await firstValueFrom(
      this.paymentService.createOrder(this.createOrderPayload())
    );

    if (!order?.paymentSessionId || !order?.orderNumber) {
      throw new Error('Invalid order response');
    }

    /** 🔹 STEP 2: Load Cashfree */
    const cf = await load({ mode: 'sandbox' });

    /** 🔹 STEP 3: Open checkout */
    await cf.checkout({
      paymentSessionId: order.paymentSessionId,

      onSuccess: () => {
        // ❗ Do NOT verify here
        // Webhook will confirm payment
        this.isPlacingOrder.set(false);

        this.router.navigate(['/payment-success'], {
          queryParams: { orderNumber: order.orderNumber }
        });
      },

      onFailure: (err: any) => {
        console.error('Payment failed:', err);
        this.isPlacingOrder.set(false);

        this.router.navigate(['/payment-failed'], {
          queryParams: {
            orderNumber: order.orderNumber,
            reason: err?.reason || 'payment_failed'
          }
        });
      }
    });

  } catch (error) {
    console.error('Payment Error:', error);
    this.isPlacingOrder.set(false);
  }
}
  applyCoupon() {
    if (!this.couponCode().trim()) {
      this.couponError.set('Please enter a coupon code.');
      this.couponSuccess.set(null);
      return;
    }

    if (this.couponCode()) {
     this.cartService.applyCoupon(this.couponCode())
      .subscribe({
        next: (response: any) => {
          this.couponCode.set(this.couponCode());
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
