import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';
import { apiResponse } from '../../../../shared/interface/response';

@Injectable({
  providedIn: 'root'
})
export class GenderService {

  constructor(private http: HttpClient) { }

  getGenderList(): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url + 'genderList');
  }

  getGenderById(id: number): Observable<apiResponse> {
    return this.http.get<apiResponse>(`${enviornment.url}gender/${id}`);
  }

  postGender(genderData: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(enviornment.url + 'gender', genderData);
  }

  updateGender(id: any, genderData: any): Observable<apiResponse> {
    return this.http.put<apiResponse>(`${enviornment.url}updateGender/${id}`, genderData);
  }

  deleteGender(id: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(`${enviornment.url}deleteGender`, id);
  }
}

