import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { enviornment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierManagementService {

  constructor(private http: HttpClient) { }
  
    getSupplierList(): Observable<any[]> {
      return this.http.get<any[]>(enviornment.url +"getSupplierList");
    }
  
    getSupplierById(id: number): Observable<any> {
      return this.http.get<any>(`${enviornment.url}Supplier/${id}`);
    }
  
    postSupplier(SupplierData: any): Observable<any> {
      return this.http.post(enviornment.url +"saveSupplier", SupplierData);
    }
  
    updateSupplier(id: any, SupplierData: any): Observable<any> {
      return this.http.put(`${enviornment.url}editSupplier/${id}`, SupplierData);
    }
  
    deleteSupplier(id: any): Observable<any> {
      return this.http.post(`${enviornment.url}deleteSupplier`, id);
    }
}
