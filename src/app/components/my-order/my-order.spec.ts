import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyOrder } from './my-order';

describe('MyOrder', () => {
  let component: MyOrder;
  let fixture: ComponentFixture<MyOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
