import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  deleteUser(id: any): Observable<any> {
    return this.http.post(`${enviornment.url}deleteUser`, id);
  }

  getUserFromLocalStorage(): any {
    const data = localStorage.getItem('role');
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${enviornment.url}getAllUsers`).pipe(
      // Filter to get specific user
      map((res: any) => {
        if (res.result && Array.isArray(res.result)) {
          const user = res.result.find((u: any) => u._id === userId || u.id === userId);
          return { ...res, result: user || null };
        }
        return { ...res, result: null };
      })
    );
  }

  updateUserProfile(userId: string, profileData: any): Observable<any> {
    return this.http.put(`${enviornment.url}updateUser/${userId}`, profileData);
  }

  updateUserProfileWithFile(userId: string, formData: FormData): Observable<any> {
    return this.http.put(`${enviornment.url}updateUser/${userId}`, formData);
  }
}
