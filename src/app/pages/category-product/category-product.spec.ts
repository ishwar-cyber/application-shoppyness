import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryProduct } from './category-product';

describe('CategoryProduct', () => {
  let component: CategoryProduct;
  let fixture: ComponentFixture<CategoryProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
