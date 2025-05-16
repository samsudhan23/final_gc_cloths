import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { enviornment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'localhost:5000/api/saveUser';
  private getallapiUrl = 'http://localhost:5000/api/getAllUsers';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<any> {
    return this.http.get(`${enviornment.url}getAllUsers`);
  }

  getUser(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  addUser(user: any): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
