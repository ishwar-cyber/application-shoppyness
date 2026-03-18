import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss'
})
export class ContactUs {

  ngOnInit(): void {
    //add scroll to top on init
    window.scrollTo(0, 0);
  }

  private fb = new FormBuilder();

  // ✅ Signal for loading
  isSubmitting = signal(false);

  // ✅ Form
  contactForm: FormGroup = this.fb.group({
    firstName: ['', [
      Validators.required,
      Validators.pattern(/^[A-Za-z]+$/),
      Validators.minLength(2),
      Validators.maxLength(100)
    ]],
    lastName: ['', [
      Validators.required,
      Validators.pattern(/^[A-Za-z]+$/),
      Validators.minLength(2),
      Validators.maxLength(100)
    ]],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    phone: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]],
    message: ['', [
      Validators.required,
      Validators.minLength(5)
    ]]
  });

  // ✅ Getter (clean access)
  get f() {
    return this.contactForm.controls;
  }

  // ✅ Submit
  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    console.log('Form Data:', this.contactForm.value);

    // simulate API
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.contactForm.reset();
    }, 1500);
  }

  // ✅ Error helper (Signal style clean logic)
  isInvalid(controlName: string) {
    const control = this.contactForm.get(controlName);
    return control && control.invalid && (control.touched || control.dirty);
  }
}
