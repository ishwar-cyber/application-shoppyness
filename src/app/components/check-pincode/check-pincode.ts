import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-check-pincode',
  imports: [CommonModule, FormsModule],
  templateUrl: './check-pincode.html',
  styleUrl: './check-pincode.scss'
})
export class CheckPincode {

  private readonly destroy$ = new Subject<void>();
  // Location popup states
  showLocationPopup = signal<boolean>(false);
  userLocation = signal<string>('');
  deliveryCheckInput$ = new Subject<string>();
  punePincodes = signal<string[]>([
    '411001', // Pune City Central
    '411002', // Camp, Pune
    '411004', // Shivaji Nagar
    '411005', // Deccan Gymkhana
    '411006', // Kothrud
    '411007', // Aundh
    '411009', // Viman Nagar
    '411014', // Hadapsar
    '411027', // Hinjewadi
    '411028'  // Baner
  ]);
  deliveryAvailable = signal<boolean>(true);
  deliveryDate = signal<string>('');
  deliveryChecking = signal<boolean>(false);

    constructor() {
      // Initialize delivery check with debounce
      this.deliveryCheckInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.deliveryChecking.set(true)),
        takeUntil(this.destroy$)
      ).subscribe(pincode => {
        this.checkDeliveryAvailability(pincode);
      });
    }
  
    // Location popup methods
  toggleLocationPopup(): void {
    this.showLocationPopup.update(val => !val);
  }

  // Handle input change for delivery check
  onDeliveryPincodeChange(pincode: string): void {
    this.userLocation.set(pincode);
    
    if (!pincode.trim() || pincode.length !== 6) {
      this.deliveryAvailable.set(false);
      this.deliveryDate.set('');
      return;
    }
    
    // Push to subject for debounced processing
    this.deliveryCheckInput$.next(pincode);
  }

  // Check delivery availability
  private checkDeliveryAvailability(pincode: string): void {
    if (!pincode || pincode.length !== 6) {
      this.deliveryChecking.set(false);
      this.deliveryAvailable.set(false);
      this.deliveryDate.set('');
      return;
    }
    
    // Mock validation - assume valid pincodes are 6 digits
    const isValidPincode = /^\d{6}$/.test(pincode);
    
    if (!isValidPincode) {
      this.deliveryChecking.set(false);
      this.deliveryAvailable.set(false);
      this.deliveryDate.set('');
      return;
    }
    
    // Simulate API call with timeout
    setTimeout(() => {
      // For Pune pincodes, use a more realistic availability check
      const isPunePincode = this.punePincodes().includes(pincode);
      
      // For Pune pincodes, all are available except 411004 and 411028
      if (isPunePincode) {
        const unavailablePincodes = ['411004', '411028'];
        const isAvailable = !unavailablePincodes.includes(pincode);
        
        this.deliveryAvailable.set(isAvailable);
        
        if (isAvailable) {
          // Calculate a faster delivery date for Pune (1-3 days)
          const days = Math.floor(Math.random() * 3) + 1; // Random number between 1-3
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + days);
          
          // Format the date
          const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          };
          this.deliveryDate.set(deliveryDate.toLocaleDateString('en-US', options));
        } else {
          this.deliveryDate.set('');
        }
      } else {
        // For non-Pune pincodes, use the original logic (odd/even)
        const lastDigit = parseInt(pincode.charAt(pincode.length - 1));
        const isAvailable = lastDigit % 2 === 0;
        
        this.deliveryAvailable.set(isAvailable);
        
        if (isAvailable) {
          // Calculate a delivery date (2-5 days from now)
          const days = Math.floor(Math.random() * 3) + 2; // Random number between 2-4
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + days);
          
          // Format the date
          const options: Intl.DateTimeFormatOptions = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          };
          this.deliveryDate.set(deliveryDate.toLocaleDateString('en-US', options));
        } else {
          this.deliveryDate.set('');
        }
      }
      
      this.deliveryChecking.set(false);
    }, 800); // Simulate network delay
  }
  
  // Get delivery date estimate for a pincode - memoized for performance
  getDeliveryEstimate(pincode: string): string {
    const isPunePincode = this.punePincodes().includes(pincode);
    
    // Calculate delivery date
    const days = isPunePincode ? 
      (Math.floor(Math.random() * 3) + 1) : // 1-3 days for Pune
      (Math.floor(Math.random() * 3) + 2);  // 2-4 days for others
      
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    
    // Format the date
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return deliveryDate.toLocaleDateString('en-US', options);
  }
  
}
