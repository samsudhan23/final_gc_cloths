import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviornment } from '../../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  constructor(private http: HttpClient) { }


  getWishList(): Observable<any[]> {
    return this.http.get<any[]>(enviornment.url + "wishList/get");
  }

  postWishlist(data: any): Observable<any> {
    return this.http.post(enviornment.url + "wishList/post", data);
  }

  updateWishList(id: any, categoryData: any): Observable<any> {
    return this.http.put(`${enviornment.url}wishList/update/${id}`, categoryData);
  }

  deleteWishList(id: { ids: string[] | number[] }): Observable<any> {
    return this.http.post(`${enviornment.url}wishList/delete`, id);
  }
}
