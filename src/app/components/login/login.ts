import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit{

  activeTab = signal<'login'| 'register'>('login');
  isLoading =signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  private formBuilder = inject(FormBuilder); 
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(Auth);

  ngOnInit(): void {
    this.initForms();

    this.route.queryParams.subscribe(params => {
      if(params['mode'] === 'register'){
        this.activeTab.set('register');
      } else {
        this.activeTab.set('login');
      }

      if(params['returnTo']){
        sessionStorage.setItem('returnUrl',`/${params['returnTo']}`);
      }
    });
  }

  initForms(){
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      email: ['',[Validators.required, Validators.email]],
      password: ['', [Validators.required,Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    })

  }
  switchTab(tab: 'login' | 'register'):void {
    this.activeTab.set(tab);
    this.error.set(null);
    this.success.set(null);

    this.router.navigate([], {
      relativeTo:this.route,
      queryParams:{mode:tab},
      queryParamsHandling: 'merge'
    })
  }

  login(){

  }
  register(){

  }

  getPasswordMatchError(): boolean{

    const passwordControl = this.registerForm.controls['password'];
    const confirmPasswordControl = this.registerForm.controls['confirmPassword'];
    if(!passwordControl || !confirmPasswordControl) return false;

    return (
      passwordControl.value !== confirmPasswordControl.value && confirmPasswordControl.touched
    );
  }
}
