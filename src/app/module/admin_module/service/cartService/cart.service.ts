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
}
