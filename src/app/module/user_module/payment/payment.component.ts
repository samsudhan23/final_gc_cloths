import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { RazorpayService } from '../../../shared/service/razorpay.service';
import { PlaceOrderService } from '../../admin_module/service/place_orders/place-order.service';

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
    CardModule,
    DividerModule,
    ButtonModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
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

  paymentProcessing: boolean = false;

  constructor(
    private razorpayService: RazorpayService,
    private placeOrderService: PlaceOrderService,
    private toast: ToastrService,
    private router: Router
  ) {}

  processPayment(): void {
    if (!this.selectedAddress) {
      this.toast.warning('Please select a delivery address');
      return;
    }

    if (this.selectedItems.length === 0) {
      this.toast.warning('No items selected');
      return;
    }

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
                      this.toast.success('Payment successful! Order placed successfully.');
                      this.paymentSuccess.emit(verifyResponse);
                      // Navigate to order confirmation page
                      if (verifyResponse.result?.orderNumber) {
                        this.router.navigate(['/user/view-order', verifyResponse.result.orderNumber]);
                      } else {
                        this.router.navigate(['/user/user-profile']);
                      }
                    } else {
                      this.toast.error(verifyResponse.message || 'Payment verification failed');
                      this.paymentError.emit(verifyResponse);
                    }
                  },
                  error: (error: any) => {
                    this.paymentProcessing = false;
                    this.toast.error(error.error?.message || 'Payment verification failed');
                    this.paymentError.emit(error);
                  }
                });
              } else {
                this.paymentProcessing = false;
                if (paymentResponse.error !== 'Payment cancelled by user') {
                  this.toast.error(paymentResponse.error || 'Payment failed');
                }
                this.paymentError.emit(paymentResponse);
              }
            },
            error: (error: any) => {
              this.paymentProcessing = false;
              this.toast.error(error.error?.message || 'Payment initiation failed');
              this.paymentError.emit(error);
            }
          });
        } else {
          this.paymentProcessing = false;
          this.toast.error(response.message || 'Failed to create order');
          this.paymentError.emit(response);
        }
      },
      error: (error: any) => {
        this.paymentProcessing = false;
        this.toast.error(error.error?.message || 'Failed to create order');
        this.paymentError.emit(error);
      }
    });
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}

