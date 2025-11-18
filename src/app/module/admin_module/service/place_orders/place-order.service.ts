import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PlaceOrderService {

  constructor(private http: HttpClient) { }

  getOrderslist(): Observable<any> {
    return this.http.get<any>(enviornment.url + "get/orders");
  }

  getOrderById(orderId: string | number): Observable<any> {
    return this.http.get<any>(`${enviornment.url}get/order/${orderId}`);
  }

  getUserOrders(userId?: string | number): Observable<any> {
    const url = userId 
      ? `${enviornment.url}get/user/orders/${userId}`
      : `${enviornment.url}get/user/orders`;
    return this.http.get<any>(url);
  }

  cancelOrder(orderId: string | number): Observable<any> {
    return this.http.post<any>(`${enviornment.url}cancel/order`, { orderId });
  }

  trackOrder(orderId: string | number): Observable<any> {
    return this.http.get<any>(`${enviornment.url}track/order/${orderId}`);
  }

  placeOrder(orderData: any): Observable<any> {
    return this.http.post<any>(`${enviornment.url}place/order`, orderData);
  }

  createRazorpayOrder(orderData: any): Observable<any> {
    return this.http.post<any>(`${enviornment.url}create/razorpay/order`, orderData);
  }

  verifyPayment(paymentData: any): Observable<any> {
    return this.http.post<any>(`${enviornment.url}verify/payment`, paymentData);
  }
}
