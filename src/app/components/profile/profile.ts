import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
interface Order {
  id?: string;
  date?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total?: number;
  items?: Array<{ id: string; name: string; quantity: number; price: number; }>;
  trackingNumber?: string;
}
interface UserSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  dataSharing: boolean;
  activityTracking: boolean;
}
@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {

  // ✅ Signals for UI state
  activeSection = signal<'profile' | 'orders' | 'password' | 'settings'>('profile');
  isLoading = signal<boolean>(true);
  updateSuccess = signal<string | null>(null);
  userProfile = signal<UserProfile | null>(null);
  orders = signal<Order[]>([]);
  isEditing = signal<boolean>(false)
  // ✅ Reactive Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // User settings 
  settings = signal<UserSettings>({ 
    orderUpdates: true, 
    promotions: false, 
    newsletter: true, 
    dataSharing: false, 
    activityTracking: true 
  });
  private authService = inject(Auth);
  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router);
  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
    this.loadOrders();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private loadUserProfile(): void {
    setTimeout(() => {
      const mockUser: UserProfile = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210'
      };
      this.userProfile.set(mockUser);
      this.profileForm.patchValue(mockUser);
      this.isLoading.set(false);
    }, 1000);
  }

  private loadOrders(): void {
    setTimeout(() => {
      const mockOrders: Order[] = [
        { id: 'ORD123', date: '2024-08-10', total: 1500, status: "delivered" },
        { id: 'ORD124', date: '2024-08-15', total: 2000, status: 'processing' }
      ];
      this.orders.set(mockOrders);
    }, 1200);
  }

  // ✅ Update profile
  updateProfile(): void {
    if (this.profileForm.invalid) return;

    setTimeout(() => {
      this.userProfile.set(this.profileForm.value);
      this.updateSuccess.set('Profile updated successfully!');
      setTimeout(() => this.updateSuccess.set(null), 3000);
    }, 1000);
  }

  // ✅ Change password
  changePassword(): void {
    if (this.passwordForm.invalid) return;

    setTimeout(() => {
      this.updateSuccess.set('Password changed successfully!');
      this.passwordForm.reset();
      setTimeout(() => this.updateSuccess.set(null), 3000);
    }, 1000);
  }

  // ✅ Password match validator
  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  // ✅ Cancel profile edit
  cancelEdit(): void {
    if (this.userProfile()) {
      this.profileForm.patchValue(this.userProfile()!);
    }
  }

  // ✅ Cancel password change
  cancelPasswordChange(): void {
    this.passwordForm.reset();
  }

  // ✅ Helpers
  getUserInitials(): string {
    const user = this.userProfile();
    return user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  }

  // trackByOrderId(index: number, order: Order): string {
  //   return order.id;
  // }


  switchSection(section: 'profile' | 'orders' | 'password' | 'settings'): void {
    this.activeSection.set(section);
  }
  saveProfile(): void {
    if (this.profileForm.valid) { // Normally this would be an API call to update the profile
      const updatedProfile = { ...this.userProfile(), ...this.profileForm.value };
      // Simulate API call 
      setTimeout(() => {
        this.userProfile.set(updatedProfile as UserProfile);
        this.isEditing.set(false);
      }, 1000);
    }
  }
  // changePassword(): void {
  //   if (this.passwordForm.valid && !this.getPasswordMatchError()) {
  //     this.passwordUpdateLoading.set(true);
  //     // Normally this would be an API call to change the password 
  //     // // Simulate API call with delay 
  //     setTimeout(() => {
  //       this.passwordUpdateLoading.set(false);
  //       this.passwordUpdateSuccess.set(true);
  //       this.passwordForm.reset();
  //       // Hide success message after 3 seconds 
  //       setTimeout(() => this.passwordUpdateSuccess.set(false), 3000);
  //     }, 1500);
  //   }
  // }
  getPasswordMatchError(): boolean {
    const newPassword = this.passwordForm?.get('newPassword')?.value;
    const confirmPassword = this.passwordForm?.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword;
  }
  toggleSetting(settingName: keyof UserSettings): void {
    const currentSettings = this.settings();
    currentSettings[settingName] = !currentSettings[settingName];
    this.settings.set({ ...currentSettings });
  }
  saveSettings(): void {
    // Normally this would be an API call to save user settings 
    // // For now we'll just simulate a successful save
    alert('Settings saved successfully!');
  } getOrderStatusClass(status: string): string {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  enableEditing(): void { this.isEditing.set(true); } cancelEditing(): void { if (this.userProfile()) { this.profileForm.patchValue(this.userProfile()!); } this.isEditing.set(false); }
}
