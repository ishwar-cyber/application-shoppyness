import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductShare } from './product-share';

describe('ProductShare', () => {
  let component: ProductShare;
  let fixture: ComponentFixture<ProductShare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductShare]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductShare);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
