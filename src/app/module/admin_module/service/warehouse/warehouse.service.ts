import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';
import { apiResponse } from '../../../../shared/interface/response';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  constructor(private http: HttpClient) { }

  getWareHouseList(): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url +"warehouseList");
  }

  getWareHouseById(id: number): Observable<apiResponse> {
    return this.http.get<apiResponse>(`${enviornment.url}categories/${id}`);
  }

  postWareHouse(wareHouseData: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(enviornment.url +"saveWareHouse", wareHouseData);
  }

  updateWareHouse(id: any, wareHouseData: any): Observable<apiResponse> {
    return this.http.put<apiResponse>(`${enviornment.url}updateWarehouse/${id}`, wareHouseData);
  }

  deleteWareHouse(id: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(`${enviornment.url}deleteWarehouse`, id);
  }
}
