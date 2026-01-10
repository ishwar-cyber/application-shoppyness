import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, exhaustMap, filter, takeUntil, tap } from 'rxjs';

import { Auth } from '../../services/auth';
import { ProfileService } from '../../services/profile-service';

/* ---------- TYPES ---------- */

interface UserProfile {
  username: string;
  email: string;
  phone?: string;
  address?: string;
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
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit, OnDestroy {

  /* ---------- SERVICES ---------- */

  private authService = inject(Auth);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private profileService = inject(ProfileService);

  /* ---------- VIEW CHILDREN ---------- */

  @ViewChild('contentRef', { static: true })
  contentRef!: ElementRef;

  @ViewChild('loadMoreTrigger', { static: true })
  loadMoreTrigger!: ElementRef;

  /* ---------- UI STATE (SIGNALS) ---------- */

  activeSection = signal<'profile' | 'orders' | 'password' | 'settings'>('profile');
  isLoading = signal(true);

  userProfile = signal<UserProfile | null>(null);
  isEditing = signal(false);

  orders = signal<any[]>([]);
  page = signal(1);
  loading = signal(false);
  hasMore = signal(true);

  settings = signal<any>({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    dataSharing: false,
    activityTracking: true
  });

  /* ---------- FORMS ---------- */

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  /* ---------- RXJS ---------- */

  private loadMore$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  private observer!: IntersectionObserver;

  /* ---------- INIT ---------- */

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
    this.initOrdersStream();
    this.initIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.observer?.disconnect();
  }

  /* ---------- FORMS ---------- */

  private initForms(): void {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /* ---------- PROFILE ---------- */

  private loadUserProfile(): void {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      this.isLoading.set(false);
      return;
    }

    this.profileService.getUserProfile(userId).subscribe((res: any) => {
      this.userProfile.set(res.data);
      this.profileForm.patchValue(res.data);
      this.isLoading.set(false);
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.userProfile.set(this.profileForm.value);
    this.isEditing.set(false);
  }

  enableEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    if (this.userProfile()) {
      this.profileForm.patchValue(this.userProfile()!);
    }
    this.isEditing.set(false);
  }

  /* ---------- ORDERS (INFINITE SCROLL) ---------- */

  private initOrdersStream(): void {
    this.loadMore$
      .pipe(
        filter(() =>
          this.activeSection() === 'orders' &&
          this.hasMore() &&
          !this.loading()
        ),
        exhaustMap(() => {
          this.loading.set(true);
          return this.profileService.getUserOrdersNew(this.page()).pipe(
            tap(res => {
              const newOrders = res?.data?.orders ?? [];
              this.orders.update(list => [...list, ...newOrders]);
              this.hasMore.set(newOrders.length > 0);
              this.page.update(p => p + 1);
              this.loading.set(false);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private initIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.loadMore$.next();
        }
      },
      {
        root: this.contentRef.nativeElement,
        threshold: 0.2
      }
    );

    this.observer.observe(this.loadMoreTrigger.nativeElement);
  }

  /* ---------- NAV ---------- */

  switchSection(section: 'profile' | 'orders' | 'password' | 'settings'): void {
    this.activeSection.set(section);

    if (section === 'orders' && this.orders().length === 0) {
      this.page.set(1);
      this.hasMore.set(true);
      this.loadMore$.next();
    }
  }

  /* ---------- PASSWORD ---------- */

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    alert('Password changed');
    this.passwordForm.reset();
  }

  private passwordMatchValidator(group: FormGroup) {
    return group.value.newPassword === group.value.confirmPassword
      ? null
      : { mismatch: true };
  }

  /* ---------- SETTINGS ---------- */

  toggleSetting(key: keyof UserSettings): void {
    this.settings.update(s => ({ ...s, [key]: !s[key] }));
  }

  saveSettings(): void {
    alert('Settings saved');
  }

  /* ---------- UTILS ---------- */

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/order-tracking'], { queryParams: { orderId } });
  }
}
