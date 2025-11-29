import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RazorpayService } from '../../../shared/service/razorpay.service';
import { PlaceOrderService } from '../../admin_module/service/place_orders/place-order.service';

declare var initTruckButton: any;
declare var gsap: any;

export interface PaymentData {
  selectedAddress: any;
  selectedItems: any[];
  totalCost: number;
  subtotal: number;
  deliveryCharge: number;
}

@Component({
  selector: 'app-payment',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DividerModule,
    ButtonModule,
    RadioButtonModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements AfterViewInit {
  @Input() selectedAddress: any = null;
  @Input() orderSummary: any = {
    subtotal: 0,
    deliveryCharge: 0,
    totalCost: 0
  };
  @Input() selectedItems: any[] = [];
  @Output() paymentSuccess = new EventEmitter<any>();
  @Output() paymentError = new EventEmitter<any>();
  @Output() goBack = new EventEmitter<void>();

  paymentMethod: 'online' | 'cod' = 'online';
  paymentProcessing: boolean = false;
  private truckButtonElement: HTMLElement | null = null;

  constructor(
    private razorpayService: RazorpayService,
    private placeOrderService: PlaceOrderService,
    private toast: ToastrService,
    private router: Router
  ) { }

  ngAfterViewInit(): void {
    // Get reference to truck button element
    setTimeout(() => {
      this.truckButtonElement = document.querySelector('.truck-button') as HTMLElement;
    }, 100);
  }

 // Button animation BUTTON Click
  onTruckButtonClick(event: Event): void {
    // Prevent default to control animation manually
    event.preventDefault();
    event.stopPropagation();

    const button = event.target as HTMLElement;
    const truckButton = button.closest('.truck-button') as HTMLElement;

    if (truckButton && !truckButton.classList.contains('animation') && !truckButton.classList.contains('done')) {
      // Start animation manually
      this.startTruckAnimation(truckButton);
      // Start payment process
      this.processPayment();
    }
  }
  // Button animation
  startTruckAnimation(button: HTMLElement): void {
    if (typeof gsap === 'undefined') return;

    const box = button.querySelector('.box');
    const truck = button.querySelector('.truck');
    if (!box || !truck) return;

    button.classList.add('animation');

    gsap.to(button, {
      '--box-s': 1,
      '--box-o': 1,
      duration: .3,
      delay: .5
    });

    gsap.to(box, {
      x: 0,
      duration: .4,
      delay: .7
    });

    gsap.to(button, {
      '--hx': -5,
      '--bx': 50,
      duration: .18,
      delay: .92
    });

    gsap.to(box, {
      y: 0,
      duration: .1,
      delay: 1.15
    });

    gsap.set(button, {
      '--truck-y': 0,
      '--truck-y-n': -26
    });

    // Don't auto-complete - wait for API response
    gsap.to(button, {
      '--truck-y': 1,
      '--truck-y-n': -25,
      duration: .2,
      delay: 1.25,
      onComplete: () => {
        // Start truck movement but don't mark as done yet
        gsap.timeline().to(truck, {
          x: 0,
          duration: .4
        }).to(truck, {
          x: 40,
          duration: 1
        }).to(truck, {
          x: 20,
          duration: .6
        }).to(truck, {
          x: 96,
          duration: .4
        });
        gsap.to(button, {
          '--progress': 1,
          duration: 2.4,
          ease: "power2.in"
        });
      }
    });
  }
  // Button animation - Success
  completeTruckAnimation(): void {
    if (!this.truckButtonElement || typeof gsap === 'undefined') return;
    this.truckButtonElement.classList.add('done');
    this.truckButtonElement.classList.remove('error-state');
  }

  // Button animation - Error
  completeTruckAnimationError(): void {
    if (!this.truckButtonElement || typeof gsap === 'undefined') return;
    const truck = this.truckButtonElement.querySelector('.truck');
    if (!truck) return;

    // Complete the animation but mark as error
    this.truckButtonElement.classList.add('done', 'error-state');
    
    // Ensure truck animation completes
    gsap.to(this.truckButtonElement, {
      '--progress': 1,
      duration: 0.1,
      ease: "power2.in"
    });
  }
  // Button animation - Reset (for retry)
  resetTruckAnimation(): void {
    if (!this.truckButtonElement || typeof gsap === 'undefined') return;

    const box = this.truckButtonElement.querySelector('.box');
    const truck = this.truckButtonElement.querySelector('.truck');
    if (!box || !truck) return;

    this.truckButtonElement.classList.remove('animation', 'done', 'error-state');

    gsap.set(truck, {
      x: 4
    });
    gsap.set(this.truckButtonElement, {
      '--progress': 0,
      '--hx': 0,
      '--bx': 0,
      '--box-s': .5,
      '--box-o': 0,
      '--truck-y': 0,
      '--truck-y-n': -26
    });
    gsap.set(box, {
      x: -24,
      y: -6
    });
  }

  processPayment(): void {
    if (!this.selectedAddress) {
      this.toast.warning('Please select a delivery address');
      return;
    }

    if (this.selectedItems.length === 0) {
      this.toast.warning('No items selected');
      return;
    }

    if (this.paymentMethod === 'cod') {
      this.placeCODOrder();
    } else {
      this.processOnlinePayment();
    }
  }
  //  COD
  placeCODOrder(): void {
    this.paymentProcessing = true;

    // Get user info
    const user = JSON.parse(localStorage.getItem('role') || '{}');
    const orderData = {
      userId: user?.id,
      items: this.selectedItems.map(item => ({
        productId: item.productId?._id || item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        price: item.productId?.price || 0
      })),
      shippingAddress: {
        firstName: this.selectedAddress.firstName,
        lastName: this.selectedAddress.lastName,
        addressLine1: this.selectedAddress.addressLine1,
        addressLine2: this.selectedAddress.addressLine2,
        city: this.selectedAddress.city,
        state: this.selectedAddress.state,
        pincode: this.selectedAddress.pincode,
        country: this.selectedAddress.country,
        phoneNumber: this.selectedAddress.phoneNumber,
        altPhoneNumber: this.selectedAddress.altPhoneNumber
      },
      totalAmount: this.orderSummary.totalCost,
      subtotal: this.orderSummary.subtotal,
      deliveryCharge: this.orderSummary.deliveryCharge,
      paymentMethod: 'COD',
      paymentStatus: 'Pending'
    };

    // Place COD order directly
    this.placeOrderService.placeOrder(orderData).subscribe({
      next: (response: any) => {
        this.paymentProcessing = false;
        if (response.code === 200 && response.success) {
          // Complete animation only on success
          this.completeTruckAnimation();
          this.toast.success('Order placed successfully! Pay cash on delivery.');
          this.paymentSuccess.emit(response);
          // Navigate to order confirmation page
          setTimeout(() => {
            if (response.result?.orderNumber) {
              this.router.navigate(['/user/view-order', response.result.orderNumber]);
            } else {
              this.router.navigate(['/user/user-profile']);
            }
          }, 500);
        } else {
          // Reset animation on failure
          this.resetTruckAnimation();
          this.toast.error(response.message || 'Failed to place order');
          this.paymentError.emit(response);
        }
      },
      error: (error: any) => {
        this.paymentProcessing = false;
        // Reset animation on error
        this.resetTruckAnimation();
        this.toast.error(error.error?.message || 'Failed to place order');
        this.paymentError.emit(error);
      }
    });
  }
  // ONLINE PAYMENT
  processOnlinePayment(): void {
    this.paymentProcessing = true;

    // Get user info
    const user = JSON.parse(localStorage.getItem('role') || '{}');
    const orderData = {
      userId: user?.id,
      items: this.selectedItems.map(item => ({
        productId: item.productId?._id || item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        price: item.productId?.price || 0
      })),
      shippingAddress: {
        firstName: this.selectedAddress.firstName,
        lastName: this.selectedAddress.lastName,
        addressLine1: this.selectedAddress.addressLine1,
        addressLine2: this.selectedAddress.addressLine2,
        city: this.selectedAddress.city,
        state: this.selectedAddress.state,
        pincode: this.selectedAddress.pincode,
        country: this.selectedAddress.country,
        phoneNumber: this.selectedAddress.phoneNumber,
        altPhoneNumber: this.selectedAddress.altPhoneNumber
      },
      totalAmount: this.orderSummary.totalCost,
      subtotal: this.orderSummary.subtotal,
      deliveryCharge: this.orderSummary.deliveryCharge
    };

    // Create Razorpay order on backend
    this.placeOrderService.createRazorpayOrder(orderData).subscribe({
      next: (response: any) => {
        if (response.code === 200 && response.success) {
          const razorpayOrderId = response.result?.orderId || response.result?.razorpay_order_id;

          // Initiate Razorpay payment
          this.razorpayService.initiatePayment({
            amount: this.orderSummary.totalCost,
            orderId: razorpayOrderId,
            customerName: `${this.selectedAddress.firstName} ${this.selectedAddress.lastName}`,
            customerEmail: user?.email || '',
            customerPhone: this.selectedAddress.phoneNumber,
            description: `Order for ${this.selectedItems.length} item(s)`
          }).subscribe({
            next: (paymentResponse: any) => {
              if (paymentResponse.success) {
                // Verify payment on backend
                this.placeOrderService.verifyPayment({
                  razorpay_order_id: paymentResponse.orderId,
                  razorpay_payment_id: paymentResponse.paymentId,
                  razorpay_signature: paymentResponse.signature,
                  orderData: orderData
                }).subscribe({
                  next: (verifyResponse: any) => {
                    this.paymentProcessing = false;
                    if (verifyResponse.code === 200 && verifyResponse.success) {
                      // Complete animation only on success
                      this.completeTruckAnimation();
                      this.toast.success('Payment successful! Order placed successfully.');
                      this.paymentSuccess.emit(verifyResponse);
                      // Navigate to order confirmation page
                      setTimeout(() => {
                        if (verifyResponse.result?.orderNumber) {
                          this.router.navigate(['/user/view-order', verifyResponse.result.orderNumber]);
                        } else {
                          this.router.navigate(['/user/user-profile']);
                        }
                      }, 500);
                    } else {
                      // Reset animation on failure
                      this.resetTruckAnimation();
                      this.toast.error(verifyResponse.message || 'Payment verification failed');
                      this.paymentError.emit(verifyResponse);
                    }
                  },
                  error: (error: any) => {
                    this.paymentProcessing = false;
                    // Reset animation on error
                    this.resetTruckAnimation();
                    this.toast.error(error.error?.message || 'Payment verification failed');
                    this.paymentError.emit(error);
                  }
                });
              } else {
                this.paymentProcessing = false;
                // Reset animation on payment failure
                this.resetTruckAnimation();
                if (paymentResponse.error !== 'Payment cancelled by user') {
                  this.toast.error(paymentResponse.error || 'Payment failed');
                }
                this.paymentError.emit(paymentResponse);
              }
            },
            error: (error: any) => {
              this.paymentProcessing = false;
              // Reset animation on error
              this.resetTruckAnimation();
              this.toast.error(error.error?.message || 'Payment initiation failed');
              this.paymentError.emit(error);
            }
          });
        } else {
          this.paymentProcessing = false;
          // Reset animation on failure
          this.resetTruckAnimation();
          this.toast.error(response.message || 'Failed to create order');
          this.paymentError.emit(response);
        }
      },
      error: (error: any) => {
        this.paymentProcessing = false;
        // Reset animation on error
        this.resetTruckAnimation();
        this.toast.error(error.error?.message || 'Failed to create order');
        this.paymentError.emit(error);
      }
    });
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}

