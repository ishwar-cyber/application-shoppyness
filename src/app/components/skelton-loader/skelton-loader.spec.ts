import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeltonLoader } from './skelton-loader';

describe('SkeltonLoader', () => {
  let component: SkeltonLoader;
  let fixture: ComponentFixture<SkeltonLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeltonLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeltonLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
