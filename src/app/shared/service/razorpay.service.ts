import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {
  private razorpayKey: string = 'YOUR_RAZORPAY_KEY_ID'; // Replace with your Razorpay Key ID

  constructor() {
    // Load Razorpay script dynamically
    this.loadRazorpayScript();
  }

  private loadRazorpayScript(): void {
    if (typeof Razorpay === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  /**
   * Create Razorpay order and open payment dialog
   * @param amount Amount in rupees (will be converted to paise)
   * @param orderId Unique order ID
   * @param customerName Customer name
   * @param customerEmail Customer email
   * @param customerPhone Customer phone
   * @param description Order description
   * @returns Observable that emits payment response
   */
  initiatePayment(options: {
    amount: number;
    orderId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    description?: string;
    prefill?: any;
  }): Observable<any> {
    return new Observable((observer) => {
      // Convert amount to paise (Razorpay uses smallest currency unit)
      const amountInPaise = Math.round(options.amount * 100);

      const razorpayOptions = {
        key: this.razorpayKey,
        amount: amountInPaise,
        currency: 'INR',
        name: 'GC CLOTHS',
        description: options.description || `Order #${options.orderId}`,
        order_id: options.orderId, // This should be created on your backend
        handler: (response: any) => {
          observer.next({
            success: true,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
          observer.complete();
        },
        prefill: {
          name: options.customerName,
          email: options.customerEmail || '',
          contact: options.customerPhone || ''
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: () => {
            observer.next({
              success: false,
              error: 'Payment cancelled by user'
            });
            observer.complete();
          }
        }
      };

      // Wait for Razorpay script to load
      const checkRazorpay = setInterval(() => {
        if (typeof Razorpay !== 'undefined') {
          clearInterval(checkRazorpay);
          const razorpay = new Razorpay(razorpayOptions);
          razorpay.open();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        if (typeof Razorpay === 'undefined') {
          clearInterval(checkRazorpay);
          observer.error({
            success: false,
            error: 'Razorpay script failed to load'
          });
        }
      }, 5000);
    });
  }

  /**
   * Verify payment signature (should be done on backend)
   * This is a client-side helper, but actual verification should be on server
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    // Note: Actual signature verification should be done on the backend
    // This is just a placeholder
    return true;
  }
}

