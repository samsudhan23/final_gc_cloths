import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';
import { apiResponse } from '../../../../shared/interface/response';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAddressService {

  constructor(private http: HttpClient) { }

  getAllDeliveryAddresses(): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url + "deliveryAddress/getAll");
  }

  getDeliveryAddressById(id: string): Observable<apiResponse> {
    return this.http.get<apiResponse>(`${enviornment.url}deliveryAddress/getById/${id}`);
  }

  addDeliveryAddress(addressData: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(enviornment.url + "deliveryAddress/add", addressData);
  }

  updateDeliveryAddress(id: string, addressData: any): Observable<apiResponse> {
    return this.http.put<apiResponse>(`${enviornment.url}deliveryAddress/update/${id}`, addressData);
  }

  deleteDeliveryAddress(ids: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(`${enviornment.url}deliveryAddress/delete`, ids);
  }

  getDeliveryAddressesByUserId(userId: string): Observable<apiResponse> {
    return this.http.get<apiResponse>(`${enviornment.url}deliveryAddress/get/${userId}`);
  }

  setDefaultAddress(id: string): Observable<apiResponse> {
    return this.http.put<apiResponse>(`${enviornment.url}deliveryAddress/setDefault/${id}`, {});
  }
}

