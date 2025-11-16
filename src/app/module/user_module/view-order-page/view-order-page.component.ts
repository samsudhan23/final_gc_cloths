import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { DialogModule } from 'primeng/dialog';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PlaceOrderService } from '../../admin_module/service/place_orders/place-order.service';
import { InvoiceService, InvoiceData } from '../../../pages/service/invoice.service';

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

interface TrackingEvent {
  status: string;
  location?: string;
  timestamp: Date;
  description: string;
  icon: string;
}

interface TrackingInfo {
  trackingNumber: string;
  currentStatus: string;
  estimatedDelivery?: Date;
  carrier?: string;
  events: TrackingEvent[];
  currentLocation?: string;
  lastUpdated?: Date;
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
    ConfirmDialogModule,
    DialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './view-order-page.component.html',
  styleUrls: ['./view-order-page.component.scss']
})
export class ViewOrderPageComponent implements OnInit, OnDestroy {
  orderId: string | null = null;
  orderDetails: OrderDetails | null = null;
  loading: boolean = false;
  trackingDialogVisible: boolean = false;
  trackingInfo: TrackingInfo | null = null;
  trackingLoading: boolean = false;
  private trackingRefreshInterval: any = null;
  private readonly TRACKING_REFRESH_INTERVAL = 30000; // 30 seconds

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastrService,
    private confirmationService: ConfirmationService,
    private orderService: PlaceOrderService,
    private invoiceService: InvoiceService
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
    if (!this.orderDetails) {
      this.toast.error('Order details not available');
      return;
    }

    try {
      // Prepare invoice data
      const invoiceData: InvoiceData = {
        // Invoice Header
        invoiceNumber: `INV-${this.orderDetails.orderNumber}`,
        invoiceDate: new Date(),
        
        // Company/Store Details (You can move these to environment or config)
        companyName: 'GC CLOTHS',
        companyAddress: '123 Fashion Street',
        companyCity: 'Chennai',
        companyState: 'Tamil Nadu',
        companyPincode: '600001',
        companyCountry: 'India',
        companyPhone: '+91 9876543210',
        companyEmail: 'support@gccloths.com',
        companyGST: 'GSTIN123456789',
        
        // Customer Details
        customerName: `${this.orderDetails.shippingAddress.firstName} ${this.orderDetails.shippingAddress.lastName}`,
        customerAddress: this.orderDetails.shippingAddress.addressLine1,
        customerCity: this.orderDetails.shippingAddress.city || '',
        customerState: this.orderDetails.shippingAddress.state || '',
        customerPincode: this.orderDetails.shippingAddress.pincode || '',
        customerCountry: this.orderDetails.shippingAddress.country || '',
        customerPhone: this.orderDetails.shippingAddress.phoneNumber,
        
        // Order Details
        orderNumber: this.orderDetails.orderNumber,
        orderDate: this.orderDetails.orderDate,
        orderStatus: this.orderDetails.status,
        
        // Shipping Address
        shippingAddress: {
          name: `${this.orderDetails.shippingAddress.firstName} ${this.orderDetails.shippingAddress.lastName}`,
          address: this.orderDetails.shippingAddress.addressLine1 + (this.orderDetails.shippingAddress.addressLine2 ? `, ${this.orderDetails.shippingAddress.addressLine2}` : ''),
          city: this.orderDetails.shippingAddress.city || '',
          state: this.orderDetails.shippingAddress.state || '',
          pincode: this.orderDetails.shippingAddress.pincode || '',
          country: this.orderDetails.shippingAddress.country || '',
          phone: this.orderDetails.shippingAddress.phoneNumber
        },
        
        // Items
        items: this.orderDetails.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
          size: item.size,
          color: item.color
        })),
        
        // Pricing
        subtotal: this.orderDetails.subtotal,
        tax: this.orderDetails.tax,
        shippingCharges: this.orderDetails.shippingCharges,
        discount: this.orderDetails.discount,
        total: this.orderDetails.total,
        
        // Payment Info
        paymentMethod: this.orderDetails.paymentInfo.method,
        transactionId: this.orderDetails.paymentInfo.transactionId,
        paymentDate: this.orderDetails.paymentInfo.paidDate,
        
        // Additional Info
        trackingNumber: this.orderDetails.trackingNumber,
        notes: `Order placed on ${this.formatDate(this.orderDetails.orderDate)}. ${this.orderDetails.status === 'Delivered' ? 'Order has been delivered successfully.' : `Order status: ${this.orderDetails.status}`}`
      };
      
      // Generate and download invoice
      this.invoiceService.generateInvoice(invoiceData);
      this.toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error generating invoice:', error);
      this.toast.error('Failed to generate invoice. Please try again.');
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  trackOrder() {
    if (!this.orderDetails?.trackingNumber || !this.orderId) {
      this.toast.warning('Tracking number not available for this order');
      return;
    }
    
    this.trackingDialogVisible = true;
    this.fetchTrackingInfo();
    
    // Start auto-refresh when dialog opens
    this.startAutoRefresh();
  }

  public fetchTrackingInfo() {
    if (!this.orderId) return;
    
    this.trackingLoading = true;
    
    // Fetch real-time tracking information from API
    this.orderService.trackOrder(this.orderId).subscribe({
      next: (response: any) => {
        this.trackingLoading = false;
        if (response.code === 200 || response.success === true) {
          const trackingData = response.result || response.data;
          this.trackingInfo = this.transformTrackingData(trackingData);
          console.log('this.trackingInfo: ', this.trackingInfo);
          // Show success message only on first load or manual refresh
          if (!this.trackingRefreshInterval) {
            this.toast.success('Tracking information updated');
          }
        } else {
          // Fallback to mock data if API doesn't return proper structure
          this.trackingInfo = this.getMockTrackingInfo();
          if (!this.trackingRefreshInterval) {
            this.toast.info('Using default tracking information');
          }
        }
      },
      error: (error: any) => {
        this.trackingLoading = false;
        // Fallback to mock data on error
        this.trackingInfo = this.getMockTrackingInfo();
        if (!this.trackingRefreshInterval) {
          this.toast.warning('Unable to fetch real-time tracking. Showing available information.');
        }
        console.error('Error fetching tracking info:', error);
      }
    });
  }

  private startAutoRefresh() {
    // Clear any existing interval
    this.stopAutoRefresh();
    
    // Set up auto-refresh every 30 seconds while dialog is open
    this.trackingRefreshInterval = setInterval(() => {
      if (this.trackingDialogVisible && this.orderId) {
        this.fetchTrackingInfo();
      } else {
        // Stop if dialog is closed
        this.stopAutoRefresh();
      }
    }, this.TRACKING_REFRESH_INTERVAL);
  }

  private stopAutoRefresh() {
    if (this.trackingRefreshInterval) {
      clearInterval(this.trackingRefreshInterval);
      this.trackingRefreshInterval = null;
    }
  }

  private transformTrackingData(data: any): TrackingInfo {
    // Transform API response to TrackingInfo format
    return {
      trackingNumber: data.trackingNumber || this.orderDetails?.trackingNumber || '',
      currentStatus: data.currentStatus || data.status || this.orderDetails?.status || 'Unknown',
      estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : this.orderDetails?.estimatedDelivery,
      carrier: data.carrier || 'Standard Shipping',
      currentLocation: data.currentLocation || data.location || 'In transit',
      lastUpdated: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
      events: this.buildTrackingEvents(data.events || data.timeline || [])
    };
  }

  private buildTrackingEvents(events: any[]): TrackingEvent[] {
    if (events && events.length > 0) {
      return events.map((event: any) => ({
        status: event.status || event.title || 'Update',
        location: event.location || '',
        timestamp: event.timestamp ? new Date(event.timestamp) : (event.date ? new Date(event.date) : new Date()),
        description: event.description || event.message || event.status || 'Order update',
        icon: this.getTrackingIcon(event.status || event.title || '')
      }));
    }
    
    // Build events from order timeline if available
    if (this.orderDetails?.timeline && this.orderDetails.timeline.length > 0) {
      return this.orderDetails.timeline.map(timeline => ({
        status: timeline.status,
        timestamp: timeline.date,
        description: timeline.description,
        icon: timeline.icon
      }));
    }
    
    // Default events based on order status
    return this.getDefaultTrackingEvents();
  }

  private getDefaultTrackingEvents(): TrackingEvent[] {
    const events: TrackingEvent[] = [];
    const orderDate = this.orderDetails?.orderDate || new Date();
    
    events.push({
      status: 'Order Placed',
      timestamp: orderDate,
      description: 'Your order has been placed successfully',
      icon: 'pi pi-shopping-cart'
    });

    if (this.orderDetails?.status === 'Processing' || 
        this.orderDetails?.status === 'Shipped' || 
        this.orderDetails?.status === 'Out for delivery' ||
        this.orderDetails?.status === 'Delivered') {
      const processingDate = new Date(orderDate);
      processingDate.setDate(processingDate.getDate() + 1);
      events.push({
        status: 'Processing',
        timestamp: processingDate,
        description: 'Your order is being prepared for shipment',
        icon: 'pi pi-cog'
      });
    }

    if (this.orderDetails?.status === 'Shipped' || 
        this.orderDetails?.status === 'Out for delivery' ||
        this.orderDetails?.status === 'Delivered') {
      const shippedDate = new Date(orderDate);
      shippedDate.setDate(shippedDate.getDate() + 2);
      events.push({
        status: 'Shipped',
        location: 'Warehouse',
        timestamp: shippedDate,
        description: 'Your order has been shipped',
        icon: 'pi pi-send'
      });
    }

    if (this.orderDetails?.status === 'Out for delivery' ||
        this.orderDetails?.status === 'Delivered') {
      const outForDeliveryDate = new Date(orderDate);
      outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 3);
      events.push({
        status: 'Out for Delivery',
        location: this.orderDetails?.shippingAddress?.city || 'Local facility',
        timestamp: outForDeliveryDate,
        description: 'Your order is out for delivery',
        icon: 'pi pi-truck'
      });
    }

    if (this.orderDetails?.status === 'Delivered') {
      const deliveredDate = this.orderDetails.estimatedDelivery || new Date(orderDate);
      deliveredDate.setDate(deliveredDate.getDate() + 4);
      events.push({
        status: 'Delivered',
        location: this.orderDetails?.shippingAddress?.addressLine1 || 'Delivery address',
        timestamp: deliveredDate,
        description: 'Your order has been delivered',
        icon: 'pi pi-check-circle'
      });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private getTrackingIcon(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('placed') || statusLower.includes('order')) return 'pi pi-shopping-cart';
    if (statusLower.includes('processing') || statusLower.includes('preparing')) return 'pi pi-cog';
    if (statusLower.includes('shipped') || statusLower.includes('dispatched')) return 'pi pi-send';
    if (statusLower.includes('transit') || statusLower.includes('transport')) return 'pi pi-truck';
    if (statusLower.includes('delivery') || statusLower.includes('out for')) return 'pi pi-map-marker';
    if (statusLower.includes('delivered')) return 'pi pi-check-circle';
    if (statusLower.includes('cancelled') || statusLower.includes('canceled')) return 'pi pi-times-circle';
    return 'pi pi-info-circle';
  }

  private getMockTrackingInfo(): TrackingInfo {
    return {
      trackingNumber: this.orderDetails?.trackingNumber || 'TRK123456789',
      currentStatus: this.orderDetails?.status || 'In Transit',
      estimatedDelivery: this.orderDetails?.estimatedDelivery,
      carrier: 'Standard Shipping',
      currentLocation: 'In transit to delivery facility',
      lastUpdated: new Date(),
      events: this.getDefaultTrackingEvents()
    };
  }

  closeTrackingDialog() {
    this.trackingDialogVisible = false;
    this.trackingInfo = null;
    // Stop auto-refresh when dialog closes
    this.stopAutoRefresh();
  }

  ngOnDestroy() {
    // Clean up interval on component destroy
    this.stopAutoRefresh();
  }

  getTrackingStatusSeverity(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'success';
    if (statusLower.includes('delivery') || statusLower.includes('out for')) return 'info';
    if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'warning';
    if (statusLower.includes('processing')) return 'secondary';
    if (statusLower.includes('cancelled') || statusLower.includes('canceled')) return 'danger';
    return 'secondary';
  }

  goBack() {
    this.router.navigate(['/user/user-profile']);
  }
}

