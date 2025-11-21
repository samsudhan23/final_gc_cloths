import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { enviornment } from '../../../../../environment/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  public WishlistLength = new BehaviorSubject<number>(0);
  updateWishlistLength$: Observable<number> = this.WishlistLength.asObservable();

  constructor(private http: HttpClient) { }


  getWishList(userId?: string): Observable<any[]> {
    const url = userId 
      ? `${enviornment.url}wishList/get?userId=${userId}`
      : `${enviornment.url}wishList/get`;
    return this.http.get<any[]>(url);
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

  deleteWishLists(id: string): Observable<any> {
    return this.http.post(`${enviornment.url}wishList/delete`, { ids: [id] });
  }

  getLengthOfWishlist(length: number) {
    this.WishlistLength.next(length)
  }
}
