import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  returnUrl: string = '/';

  private formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(Auth);
  private readonly cookiesService = inject(CookieService);
  private readonly toastr = inject(ToastrService);
  private readonly platformId = inject(PLATFORM_ID) as Object;

  ngOnInit(): void {
    this.initForms();

    if (isPlatformBrowser(this.platformId)) {
      this.route.queryParams.subscribe(params => {
        if (params['mode'] === 'register') {
          this.activeTab.set('register');
        } else {
          this.activeTab.set('login');
        }

        if (params['returnUrl']) {
          sessionStorage.setItem('returnUrl', `${params['returnUrl']}`);
          this.returnUrl = params['returnUrl'];
        }
      });
    }
  }

  initForms() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.error.set(null);
    this.success.set(null);

    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { mode: tab },
        queryParamsHandling: 'merge'
      });
    }
  }

  login() {
    if (!this.loginForm.valid) {
      alert('Enter your valid credentials');
      return;
    }

    this.isLoading.set(true);
    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(payload).subscribe({
      next: (login: any) => {
        this.authService.userName.set(login.user.username);
        this.authService.isLoggedInSignal.set(true);

        if (isPlatformBrowser(this.platformId)) {
          // Set auth token cookie
          this.cookiesService.set('authToken', login.token, { path: '/', secure: true, sameSite: 'Lax' });

          // Merge visitor cart if exists
          const visitorId = this.cookiesService.get('visitorId');
          if (login.success && visitorId) {
            this.authService.mergeCartToUser({ visitorId }).subscribe(() => { });
          }

          // Navigate to return URL
          this.router.navigateByUrl(this.returnUrl);
        }

        this.success.set(`${login.user.name} login successfully`);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.error.set(err.error?.message || 'Login failed');
        this.isLoading.set(false);
      }
    });
  }

  register() {
    if (!this.registerForm.valid) return;

    const value = this.registerForm.value;
    const payload = {
      username: value.name,
      email: value.email,
      phone: value.phone,
      password: value.password,
      confirmPassword: value.confirmPassword
    };

    this.authService.signUp(payload).subscribe({
      next: (res) => {
        this.switchTab('login');
        if (isPlatformBrowser(this.platformId)) {
          this.toastr.success('Register successfully');
        }
      },
      error: (err) => {
        console.log(err);
        this.error.set(err.error?.message || 'Registration failed');
      }
    });
  }

  getPasswordMatchError(): boolean {
    const passwordControl = this.registerForm.controls['password'];
    const confirmPasswordControl = this.registerForm.controls['confirmPassword'];
    if (!passwordControl || !confirmPasswordControl) return false;
    return (
      passwordControl.value !== confirmPasswordControl.value && confirmPasswordControl.touched
    );
  }
}
