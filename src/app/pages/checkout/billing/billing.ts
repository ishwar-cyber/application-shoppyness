import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutService } from '../../../services/checkout';

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string; // Default = 'India'
}
@Component({
  selector: 'app-billing',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.scss'
})
export class Billing implements OnInit {
 // Signal-based inputs/outputs
  addresses = input<Address[]>([]);
  addressChange = output<any>();
  addAddress = output<Address>();
  continue = output<void>();
  openStateSearch =signal<boolean>(false);
  selectedAddress = signal<Address | null>(null);
   // dummy state list
  allStates = [
    'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi',
    'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Kerala', 'West Bengal'
  ];
  searchState = signal<string>('');
  filteredStates = signal(this.allStates);

  // Local UI state
  showForm = signal(false);
  addressForm!: FormGroup;
  addressesList = signal<Address[]>([]);
  private fb = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  
  ngOnInit(): void {
    this.addressesList.set(this.addresses());
    this.buildForm();
    this.getUserData();
  }

  getUserData() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.checkoutService.getUserData(userId).subscribe({
        next: (response: any) => {
            this.addressesList.set(response.data);
        }
      });
    }
  }
  buildForm() {
    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      line1: ['', [Validators.required, Validators.minLength(6)]],
      line2: [''],
      landmark: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      country: ['India', Validators.required],
    });
  }
  onSelectAddress(id: string) {
    this.selectedAddress.set(this.addressesList().find(a => a._id === id) || null);
    this.addressChange.emit(this.selectedAddress());
  }
  selectState(state: string) {
    this.addressForm.patchValue({ state });
    this.searchState.set(state);
  }
  saveAddress() {
    if (this.addressForm.invalid) return;
    const newAddr: Address = { ...this.addressForm.value };
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in sessionStorage. Skipping address update.');
    } else {
      this.checkoutService.updateAddress(userId, { address: newAddr }).subscribe({
        next: () => {
          console.log('Address updated successfully');
        },
        error: (err) => {
          console.error('Error updating address:', err);
        }
      });
    }

    this.addAddress.emit(newAddr);
    this.addressForm.reset();
    this.showForm.set(false);
  }
  filterStates(value: any) {
    let valueSearch = value.target.value;
    this.searchState.set(valueSearch);
    this.filteredStates.set(
      this.allStates.filter(s =>
        s.toLowerCase().includes(valueSearch.toLowerCase())
      )
    );
  }
}
