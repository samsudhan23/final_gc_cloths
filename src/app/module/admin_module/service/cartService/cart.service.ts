import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';
import { apiResponse } from '../../../../shared/interface/response';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  public CartLength = new BehaviorSubject<number>(0);
  updateCartLength$: Observable<number> = this.CartLength.asObservable();

  constructor(private http: HttpClient) { }

  getCartList(userId?: string): Observable<apiResponse> {
    const url = userId 
      ? `${enviornment.url}cart/get?userId=${userId}`
      : `${enviornment.url}cart/get`;
    return this.http.get<apiResponse>(url);
  }

  postCart(data: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(enviornment.url + "cart/add", data);
  }

  updateCartItem(id: any, Data: any): Observable<apiResponse> {
    return this.http.put<apiResponse>(`${enviornment.url}cart/update/${id}`, Data);
  }

  deleteCartItem(id: { ids: string[] | number[] }): Observable<apiResponse> {
    return this.http.post<apiResponse>(`${enviornment.url}cart/delete`, id);
  }
  getLengthOfCart(length: number) {
    this.CartLength.next(length)
  }
}
