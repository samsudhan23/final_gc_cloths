import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryAddressManagementComponent } from './delivery-address-management.component';

describe('DeliveryAddressManagementComponent', () => {
  let component: DeliveryAddressManagementComponent;
  let fixture: ComponentFixture<DeliveryAddressManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryAddressManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryAddressManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
