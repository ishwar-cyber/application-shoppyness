import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentStatus } from './payment-status';

describe('PaymentStatus', () => {
  let component: PaymentStatus;
  let fixture: ComponentFixture<PaymentStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentStatus]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentStatus);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
