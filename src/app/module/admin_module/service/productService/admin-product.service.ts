import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';
import { apiResponse } from '../../../../shared/interface/response';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {

  constructor(private http: HttpClient) { }

  private productID = new BehaviorSubject<string>('');
  selectedProdID$ = this.productID.asObservable();

  getProductlist(): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url + "getProducts");
  }

  saveProducts(data: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(enviornment.url + "products", data);
  }

  updateProducts(data: any, id: number | string): Observable<apiResponse> {
    return this.http.put<apiResponse>(enviornment.url + "updateProducts/" + id, data);
  }

  deleteProducts(id: { ids: string[] | number[] }): Observable<apiResponse> {
    return this.http.post<apiResponse>(`${enviornment.url}deleteProducts`, id);
  }

  geyProductsById(id: any): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url + "getByIDProducts/" + id);
  }

  setSelectedProdID(id: string) {
    sessionStorage.setItem('prodID', id)
    this.productID.next(id)
  }
}
