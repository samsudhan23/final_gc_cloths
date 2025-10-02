import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { enviornment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public currentUserSubject = new BehaviorSubject<any>(null);
   currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('role');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
  login(user: any): Observable<any> {
    return this.http.post<any>(enviornment.url + "auth/login", user).pipe(tap(res => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('role', JSON.stringify(res.result));
        this.currentUserSubject.next(res.result);
      }
    }));
  }

  reset(pass: any, token: any): Observable<any> {
    return this.http.post<any>(enviornment.url + `auth/reset-password/${token}`, pass)
  }
}
