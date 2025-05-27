import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {

  constructor(private http: HttpClient) { }

  getProductlist(): Observable<any> {
    return this.http.get<any>(enviornment.url + "getProducts");
  }

  saveProducts(data: any): Observable<any> {
    return this.http.post<any>(enviornment.url + "products", data);
  }

  updateProducts(data: any, id: number | string): Observable<any> {
    return this.http.put<any>(enviornment.url + "updateProducts/" + id, data);
  }

    deleteProducts(id: string): Observable<any> {
    return this.http.delete(`${enviornment.url}deleteProducts/${id}`);
  }
}
