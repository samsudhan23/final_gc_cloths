import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'localhost:5000/api/saveUser';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get(`${enviornment.url}getAllUsers`);
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(`${enviornment.url}saveUser`, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${enviornment.url}updateUser/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${enviornment.url}deleteUser/${id}`);
  }
}
