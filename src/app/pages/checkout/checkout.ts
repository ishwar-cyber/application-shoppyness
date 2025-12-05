import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart';
import { CheckoutService } from '../../services/checkout';
import { ProfileService } from '../../services/profile-service';
import { PopUp } from '../../components/pop-up/pop-up';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, PopUp],
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
  selectedAddress = computed(() => {
    return this.addressList().find(addr => addr._id === this.selectedAddressId());
  })
  couponError = signal<string | null>(null);
  couponSuccess = signal<string | null>(null);
  private readonly cartService = inject(CartService);
  private readonly profileService = inject(ProfileService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  addressForm!: FormGroup;

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses();
  }

  loadCart() {
    this.cartService.loadCart().subscribe((res: any) => {
      this.cartItems.set(res.data.items);
      this.totalAmount.set(res.data.subTotal);
      this.subTotal.set(res.data.subTotal);
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

    const orderPayload = {
      shippingAddress:  this.selectedAddress(),
      paymentMethod: this.paymentMethod(),
      items: this.cartService.cartItems() || this.cartItems(),
      totalAmount: this.totalAmount(),
      couponDiscount: this.couponDiscount() || null
    };

    this.checkoutService.createOrder(orderPayload).subscribe({
      next: (res: any) => {
        console.log('payments response', res);
           this.router.navigate([`/payment-success?orderId=${res.orderNumber}`]);
        // this.router.navigate(['/order-success'], {
        //   queryParams: { orderId: res?.orderId }
        // });
      },
      error: (err) => console.error(err)
    });
  }  
  applyCoupon() {
    if (!this.couponCode.trim()) {
      this.couponError.set('Please enter a coupon code.');
      this.couponSuccess.set(null);
      return;
    }

    // Example coupon logic
    if (this.couponCode) {
      
      // Apply discount logic...
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
