import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) { }

  getCartList(): Observable<any[]> {
    return this.http.get<any[]>(enviornment.url + `cart/get`);
  }

  postCart(data: any): Observable<any> {
    return this.http.post(enviornment.url + "cart/add", data);
  }

  updateCartItem(id: any, Data: any): Observable<any> {
    return this.http.put(`${enviornment.url}cart/update/${id}`, Data);
  }

  deleteCartItem(id: { ids: string[] | number[] }): Observable<any> {
    return this.http.post(`${enviornment.url}cart/delete`, id);
  }
}
