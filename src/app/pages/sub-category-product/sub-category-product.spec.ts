import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryProduct } from './sub-category-product';

describe('SubCategoryProduct', () => {
  let component: SubCategoryProduct;
  let fixture: ComponentFixture<SubCategoryProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubCategoryProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubCategoryProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
