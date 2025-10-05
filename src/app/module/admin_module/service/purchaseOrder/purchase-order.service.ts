import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }
    
      getPurchaseOrderList(): Observable<any[]> {
        return this.http.get<any[]>(enviornment.url +"getPurchsaeOrderList");
      }
    
      getPurchaseOrderById(id: number): Observable<any> {
        return this.http.get<any>(`${enviornment.url}PurchaseOrder/${id}`);
      }
    
      postPurchaseOrder(PurchaseOrderData: any): Observable<any> {
        return this.http.post(enviornment.url +"savePurchaseOrder", PurchaseOrderData);
      }
    
      updatePurchaseOrder(id: any, PurchaseOrderData: any): Observable<any> {
        return this.http.put(`${enviornment.url}editPurchaseOrder/${id}`, PurchaseOrderData);
      }
    
      deletePurchaseOrder(id: any): Observable<any> {
        return this.http.post(`${enviornment.url}deletePurchaseOrder`, id);
      }
  }
  