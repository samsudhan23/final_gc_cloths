import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {

  constructor(private http: HttpClient) { }
  
    getProductVariantList(): Observable<any[]> {
      return this.http.get<any[]>(enviornment.url +"getProductVariant");
    }
  
    getProductVariantById(id: number): Observable<any> {
      return this.http.get<any>(`${enviornment.url}ProductVariant/${id}`);
    }
  
    postProductVariant(categoryData: any): Observable<any> {
      return this.http.post(enviornment.url +"saveProductVariant", categoryData);
    }
  
    updateProductVariant(id: any, categoryData: any): Observable<any> {
      return this.http.put(`${enviornment.url}editProductVariant/${id}`, categoryData);
    }
  
    deleteProductVariant(id: any): Observable<any> {
      return this.http.post(`${enviornment.url}deleteProductVariant`, id);
    }
}
