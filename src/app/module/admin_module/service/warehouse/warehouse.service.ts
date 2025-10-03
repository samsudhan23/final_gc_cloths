import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  constructor(private http: HttpClient) { }

  getWareHouseList(): Observable<any[]> {
    return this.http.get<any[]>(enviornment.url +"warehouseList");
  }

  getWareHouseById(id: number): Observable<any> {
    return this.http.get<any>(`${enviornment.url}categories/${id}`);
  }

  postWareHouse(wareHouseData: any): Observable<any> {
    return this.http.post(enviornment.url +"saveWareHouse", wareHouseData);
  }

  updateWareHouse(id: any, wareHouseData: any): Observable<any> {
    return this.http.put(`${enviornment.url}updateWarehouse/${id}`, wareHouseData);
  }

  deleteWareHouse(id: any): Observable<any> {
    return this.http.post(`${enviornment.url}deleteWarehouse`, id);
  }
}
