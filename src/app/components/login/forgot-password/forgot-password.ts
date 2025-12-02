import { Component, inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../../services/auth';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {


fb = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);

  loading = false;
  success: string | null = null;
  error: string | null = null;

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit() {
    if (!this.forgotForm.valid) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    this.auth.forgotPassword(this.forgotForm.value).subscribe({
      next: () => {
        this.success = "Password reset link sent to your email.";
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || "Failed to send reset link.";
        this.loading = false;
      }
    });
  }

}
