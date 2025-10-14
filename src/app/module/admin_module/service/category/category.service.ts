import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';
import { apiResponse } from '../../../../shared/interface/response';

export interface Category {
  id?: number;
  categoryName: string;
  categoryDescription?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }

  getCategoriesMasterList(): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url +"getCategories");
  }

  getCategoryMaterById(id: number): Observable<apiResponse> {
    return this.http.get<apiResponse>(`${enviornment.url}categories/${id}`);
  }

  postCategoryMaster(categoryData: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(enviornment.url +"categories", categoryData);
  }

  updateCategoryMaster(id: any, categoryData: any): Observable<apiResponse> {
    return this.http.put<apiResponse>(`${enviornment.url}updateCategory/${id}`, categoryData);
  }

  deleteCategoryMaster(id: any): Observable<apiResponse> {
    return this.http.post<apiResponse>(`${enviornment.url}deleteCategory`, id);
  }
  getGenderList(): Observable<apiResponse> {
    return this.http.get<apiResponse>(enviornment.url + 'genderList');
  }
}
