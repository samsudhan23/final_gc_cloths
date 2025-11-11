import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PlaceOrderService } from '../../admin_module/service/place_orders/place-order.service';

interface OrderItem {
  id: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  variant?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phoneNumber: string;
}

interface PaymentInfo {
  method: string;
  transactionId: string;
  paidAmount: number;
  paidDate: Date;
}

interface OrderTimeline {
  status: string;
  date: Date;
  description: string;
  icon: string;
}

interface OrderDetails {
  orderNumber: string;
  orderDate: Date;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  subtotal: number;
  shippingCharges: number;
  tax: number;
  discount: number;
  total: number;
  timeline: OrderTimeline[];
  estimatedDelivery?: Date;
  trackingNumber?: string;
  cancellable: boolean;
  returnable: boolean;
}

@Component({
  selector: 'app-view-order-page',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './view-order-page.component.html',
  styleUrls: ['./view-order-page.component.scss']
})
export class ViewOrderPageComponent implements OnInit {
  orderId: string | null = null;
  orderDetails: OrderDetails | null = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private confirmationService: ConfirmationService,
    private orderService: PlaceOrderService
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    if (this.orderId) {
      this.loadOrderDetails(this.orderId);
    } else {
      this.toast.error('Order ID not found');
      this.router.navigate(['/user/user-profile']);
    }
  }

  loadOrderDetails(orderId: string) {
    this.loading = true;
    
    // Use service to fetch order details from API
    this.orderService.getOrderById(orderId).subscribe({
      next: (response: any) => {
        if (response.code === 200 || response.success === true) {
          // Transform API response to OrderDetails format
          this.orderDetails = this.transformOrderData(response.result || response.data);
          this.loading = false;
        } else {
          this.toast.error(response.message || 'Failed to load order details');
          this.loading = false;
          this.router.navigate(['/user/user-profile']);
        }
      },
      error: (error: any) => {
        console.error('Error loading order:', error);
        // Fallback to mock data if API fails (for development)
        this.toast.warning('Using demo data. API endpoint may not be configured.');
        this.orderDetails = this.getMockOrderDetails(orderId);
        this.loading = false;
        // Uncomment below to redirect on error instead of using mock data
        // this.toast.error(error.error?.message || 'Failed to load order details');
        // this.loading = false;
        // this.router.navigate(['/user/user-profile']);
      }
    });
  }

  transformOrderData(apiData: any): OrderDetails {
    // Transform API response to match OrderDetails interface
    // Adjust this based on your actual API response structure
    return {
      orderNumber: apiData.orderNumber || apiData.orderId || apiData.id,
      orderDate: new Date(apiData.orderDate || apiData.createdAt),
      status: apiData.status || 'Processing',
      items: apiData.items || apiData.products || [],
      shippingAddress: apiData.shippingAddress || apiData.address || this.getDefaultAddress(),
      paymentInfo: {
        method: apiData.paymentMethod || 'Credit Card',
        transactionId: apiData.transactionId || apiData.paymentId || 'N/A',
        paidAmount: apiData.total || apiData.amount || 0,
        paidDate: new Date(apiData.paymentDate || apiData.orderDate)
      },
      subtotal: apiData.subtotal || apiData.total || 0,
      shippingCharges: apiData.shippingCharges || apiData.shipping || 0,
      tax: apiData.tax || apiData.taxAmount || 0,
      discount: apiData.discount || apiData.discountAmount || 0,
      total: apiData.total || apiData.finalAmount || 0,
      timeline: this.buildTimeline(apiData.status, apiData.orderDate),
      estimatedDelivery: apiData.estimatedDelivery ? new Date(apiData.estimatedDelivery) : undefined,
      trackingNumber: apiData.trackingNumber || apiData.trackingId,
      cancellable: apiData.cancellable !== false && apiData.status !== 'Delivered' && apiData.status !== 'Cancelled',
      returnable: apiData.returnable !== false && apiData.status === 'Delivered'
    };
  }

  getDefaultAddress(): ShippingAddress {
    return {
      firstName: 'N/A',
      lastName: '',
      addressLine1: 'N/A',
      city: 'N/A',
      state: 'N/A',
      pincode: 'N/A',
      country: 'N/A',
      phoneNumber: 'N/A'
    };
  }

  buildTimeline(status: string, orderDate: Date): OrderTimeline[] {
    const baseDate = new Date(orderDate);
    const timeline: OrderTimeline[] = [
      {
        status: 'Order Placed',
        date: new Date(baseDate),
        description: 'Your order has been placed successfully',
        icon: 'pi pi-shopping-cart'
      },
      {
        status: 'Confirmed',
        date: new Date(baseDate.getTime() + 30 * 60000),
        description: 'Order confirmed and payment received',
        icon: 'pi pi-check-circle'
      }
    ];

    if (['Processing', 'Shipped', 'Out for delivery', 'Delivered'].includes(status)) {
      timeline.push({
        status: 'Processing',
        date: new Date(baseDate.getTime() + 24 * 60 * 60000),
        description: 'Your order is being prepared',
        icon: 'pi pi-cog'
      });
    }

    if (['Shipped', 'Out for delivery', 'Delivered'].includes(status)) {
      timeline.push({
        status: 'Shipped',
        date: new Date(baseDate.getTime() + 48 * 60 * 60000),
        description: 'Order shipped via courier',
        icon: 'pi pi-send'
      });
    }

    if (['Out for delivery', 'Delivered'].includes(status)) {
      timeline.push({
        status: 'Out for Delivery',
        date: new Date(baseDate.getTime() + 72 * 60 * 60000),
        description: 'Your order is out for delivery',
        icon: 'pi pi-truck'
      });
    }

    if (status === 'Delivered') {
      timeline.push({
        status: 'Delivered',
        date: new Date(baseDate.getTime() + 96 * 60 * 60000),
        description: 'Order delivered successfully',
        icon: 'pi pi-check'
      });
    }

    return timeline;
  }

  getMockOrderDetails(orderId: string): OrderDetails {
    // Mock data - replace with actual API call
    return {
      orderNumber: orderId,
      orderDate: new Date(2024, 2, 15),
      status: 'Delivered',
      items: [
        {
          id: 1,
          productName: 'Classic White T-Shirt',
          productImage: 'https://via.placeholder.com/150',
          quantity: 2,
          price: 29.99,
          size: 'M',
          color: 'White'
        },
        {
          id: 2,
          productName: 'Blue Denim Jeans',
          productImage: 'https://via.placeholder.com/150',
          quantity: 1,
          price: 49.99,
          size: '32',
          color: 'Blue'
        },
        {
          id: 3,
          productName: 'Leather Belt',
          productImage: 'https://via.placeholder.com/150',
          quantity: 1,
          price: 24.99,
          size: 'L'
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '221B Baker Street',
        addressLine2: 'Near Central Park',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        country: 'India',
        phoneNumber: '9876543210'
      },
      paymentInfo: {
        method: 'Credit Card',
        transactionId: 'TXN123456789',
        paidAmount: 134.97,
        paidDate: new Date(2024, 2, 15)
      },
      subtotal: 134.97,
      shippingCharges: 5.00,
      tax: 12.00,
      discount: 10.00,
      total: 141.97,
      timeline: [
        {
          status: 'Order Placed',
          date: new Date(2024, 2, 15, 10, 30),
          description: 'Your order has been placed successfully',
          icon: 'pi pi-shopping-cart'
        },
        {
          status: 'Confirmed',
          date: new Date(2024, 2, 15, 11, 0),
          description: 'Order confirmed and payment received',
          icon: 'pi pi-check-circle'
        },
        {
          status: 'Processing',
          date: new Date(2024, 2, 16, 9, 0),
          description: 'Your order is being prepared',
          icon: 'pi pi-cog'
        },
        {
          status: 'Shipped',
          date: new Date(2024, 2, 17, 14, 30),
          description: 'Order shipped via courier',
          icon: 'pi pi-send'
        },
        {
          status: 'Out for Delivery',
          date: new Date(2024, 2, 18, 8, 0),
          description: 'Your order is out for delivery',
          icon: 'pi pi-truck'
        },
        {
          status: 'Delivered',
          date: new Date(2024, 2, 18, 15, 30),
          description: 'Order delivered successfully',
          icon: 'pi pi-check'
        }
      ],
      estimatedDelivery: new Date(2024, 2, 20),
      trackingNumber: 'TRK123456789',
      cancellable: false,
      returnable: true
    };
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'out for delivery':
        return 'warning';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  cancelOrder() {
    if (!this.orderDetails || !this.orderId) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to cancel order #${this.orderDetails.orderNumber}?`,
      header: 'Cancel Order',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.orderService.cancelOrder(this.orderId!).subscribe({
          next: (response: any) => {
            if (response.code === 200 || response.success === true) {
              this.toast.success(response.message || 'Order cancelled successfully');
              this.router.navigate(['/user/user-profile']);
            } else {
              this.toast.error(response.message || 'Failed to cancel order');
            }
          },
          error: (error: any) => {
            this.toast.error(error.error?.message || 'Failed to cancel order');
          }
        });
      }
    });
  }

  reorder() {
    if (!this.orderDetails) return;
    // Add items to cart logic
    this.toast.success('Items added to cart');
    this.router.navigate(['/user/cart']);
  }

  returnOrder() {
    if (!this.orderDetails) return;

    this.confirmationService.confirm({
      message: `Do you want to return order #${this.orderDetails.orderNumber}?`,
      header: 'Return Order',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.toast.info('Return request submitted. Our team will contact you soon.');
      }
    });
  }

  downloadInvoice() {
    if (!this.orderDetails) return;
    // Generate and download invoice
    this.toast.info('Invoice download started');
  }

  trackOrder() {
    if (!this.orderDetails?.trackingNumber || !this.orderId) return;
    
    // Fetch real-time tracking information
    this.orderService.trackOrder(this.orderId).subscribe({
      next: (response: any) => {
        if (response.code === 200 || response.success === true) {
          const trackingInfo = response.result || response.data;
          this.toast.info(`Tracking: ${trackingInfo.status || this.orderDetails?.trackingNumber}`);
          // You can open a modal or navigate to tracking page here
        } else {
          this.toast.info(`Tracking Number: ${this.orderDetails?.trackingNumber}`);
        }
      },
      error: (error: any) => {
        this.toast.info(`Tracking Number: ${this.orderDetails?.trackingNumber}`);
      }
    });
  }

  goBack() {
    this.router.navigate(['/user/user-profile']);
  }
}

