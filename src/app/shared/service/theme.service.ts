import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

    setRole(role:string) {
    document.body.classList.remove('user-role', 'admin-role');
    document.body.classList.add(`${role}-role`);
  }
}
