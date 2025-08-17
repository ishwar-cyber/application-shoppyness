import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
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
  returnUrl: string = '/';
  private formBuilder = inject(FormBuilder); 
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(Auth);
  private readonly cookiesService = inject(CookieService);
  private readonly toastr = inject(ToastrService)

  ngOnInit(): void {
    this.initForms();

    this.route.queryParams.subscribe(params => {
      if(params['mode'] === 'register'){
        this.activeTab.set('register');
      } else {
        this.activeTab.set('login');
      }

      if(params['returnUrl']){
        sessionStorage.setItem('returnUrl',`${params['returnurl']}`);
        this.returnUrl = params['returnUrl']
      }
    });
  }

  initForms(){
    this.loginForm = this.formBuilder.group({
      email:['', [Validators.required, Validators.email]],
      password:['', [Validators.required]]
    });

    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['',[Validators.required, Validators.email]],
      phone: ['',[Validators.required,Validators.pattern(/^[6-9]\d{9}$/)]],
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
    if(this.loginForm.valid){
      let payload = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }
      this.authService.login(payload).subscribe({
        next: (login: any) =>{
          this.authService.userName.set(login.user.username);
          if(login.success && this.cookiesService.get('visitorId')){
            const payload = {
              visitorId : this.cookiesService.get('visitorId')
            }
              this.authService.margeCartToUser(payload).subscribe({
                next: ()=>{

                }
              })
          }
         this.success.set(`${login.user.name} login successfully`)
          this.cookiesService.set('authToken', login.token, { path: '/', secure: true, sameSite: 'Lax' });
          this.authService.isLoggedIn.set(true);
         this.router.navigateByUrl(this.returnUrl);
        },
        error :(err)=>{
          console.log(err);
          this.error.set(err.error.message);
        }
      })
    } else{
      alert('Enter your valid Crediantional')
    }
  }
  register(){
    if(this.registerForm.valid){
      let value = this.registerForm.value;
      const payload = {
        username: value.name,
        email: value.email,
        phone: value.phone,
        password: value.password,
        confirmPassword: value.confirmPassword
      };
      this.authService.signUp(payload).subscribe({
        next : (res)=>{
            this.switchTab('login' )
          console.log('login', res);
          this.toastr.success('Register successfully')
        }
      })
    }
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
