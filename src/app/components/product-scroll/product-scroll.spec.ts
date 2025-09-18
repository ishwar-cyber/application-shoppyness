import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductScroll } from './product-scroll';

describe('ProductScroll', () => {
  let component: ProductScroll;
  let fixture: ComponentFixture<ProductScroll>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductScroll]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductScroll);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
