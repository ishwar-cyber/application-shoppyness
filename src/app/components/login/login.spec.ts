import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Login } from './login';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ViewportScroller } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  let mockAuth: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockCookieService: any;

  beforeEach(async () => {
    mockAuth = {
      login: jasmine.createSpy('login').and.returnValue(of({ success: true, user: { username: 'john', _id: '1' }, token: 't' })),
      userName: { set: jasmine.createSpy('set') },
      isLoggedInSignal: { set: jasmine.createSpy('set') },
      userId: { set: jasmine.createSpy('set') },
      mergeCartToUser: jasmine.createSpy('mergeCartToUser').and.returnValue(of({}))
    };

    mockRouter = { navigateByUrl: jasmine.createSpy('navigateByUrl'), navigate: jasmine.createSpy('navigate') };

    mockActivatedRoute = {
      snapshot: { queryParams: { returnUrl: '/checkout' } },
      queryParams: of({})
    };

    mockCookieService = { get: jasmine.createSpy('get').and.returnValue(''), set: jasmine.createSpy('set') };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: { success: jasmine.createSpy('success') } },
        { provide: ViewportScroller, useValue: { scrollToPosition: jasmine.createSpy('scroll') } },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to returnUrl after successful login', () => {
    component.loginForm.controls['email'].setValue('a@b.com');
    component.loginForm.controls['password'].setValue('123456');

    component.login();

    expect(mockAuth.login).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/checkout');
  });

  it('alerts when form is invalid', () => {
    spyOn(window, 'alert');
    component.loginForm.controls['email'].setValue('');
    component.login();
    expect(window.alert).toHaveBeenCalledWith('Enter your valid credentials');
  });
});
