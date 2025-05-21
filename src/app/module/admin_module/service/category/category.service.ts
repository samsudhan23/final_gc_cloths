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

  private apiUrl = 'http://localhost:5000/api/categories';
  private getapiUrl = 'http://localhost:5000/api/getCategories';
  private deleteapiUrl = 'http://localhost:5000/api/deleteCategory';

  constructor(private http: HttpClient) { }


  getCategoriesMasterList(): Observable<any[]> {
    return this.http.get<any[]>(this.getapiUrl);
  }

  getCategoryMaterById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  postCategoryMaster(categoryData: any): Observable<any> {
    return this.http.post(this.apiUrl, categoryData);
  }

  updateCategoryMaster(id: number, categoryData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategoryMaster(id: any): Observable<any> {
    return this.http.delete(`${this.deleteapiUrl}/${id}`);
  }
  getGenderList(): Observable<any[]> {
    return this.http.get<any[]>(enviornment.url + 'genderList');
  }
}
