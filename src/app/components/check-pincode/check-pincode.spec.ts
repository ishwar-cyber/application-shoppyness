import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckPincode } from './check-pincode';

describe('CheckPincode', () => {
  let component: CheckPincode;
  let fixture: ComponentFixture<CheckPincode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckPincode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckPincode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
