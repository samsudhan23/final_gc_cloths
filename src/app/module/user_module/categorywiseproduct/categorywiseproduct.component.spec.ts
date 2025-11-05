import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorywiseproductComponent } from './categorywiseproduct.component';

describe('CategorywiseproductComponent', () => {
  let component: CategorywiseproductComponent;
  let fixture: ComponentFixture<CategorywiseproductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorywiseproductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorywiseproductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
