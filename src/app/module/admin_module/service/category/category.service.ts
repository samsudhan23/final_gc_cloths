import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

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

  getCategoriesMasterList(): Observable<any[]> {
    return this.http.get<any[]>(enviornment.url +"getCategories");
  }

  getCategoryMaterById(id: number): Observable<any> {
    return this.http.get<any>(`${enviornment.url}categories/${id}`);
  }

  postCategoryMaster(categoryData: any): Observable<any> {
    return this.http.post(enviornment.url +"categories", categoryData);
  }

  updateCategoryMaster(id: any, categoryData: any): Observable<any> {
    return this.http.put(`${enviornment.url}updateCategory/${id}`, categoryData);
  }

  deleteCategoryMaster(id: any): Observable<any> {
    return this.http.post(`${enviornment.url}deleteCategory`, id);
  }
  getGenderList(): Observable<any[]> {
    return this.http.get<any[]>(enviornment.url + 'genderList');
  }
}
