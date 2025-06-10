// login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(): boolean {
        const user = JSON.parse(localStorage.getItem('role') || '{}');
        const role = user?.role;

        if (role === 'admin') {
            this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
            return false;
        } else if (role === 'user') {
            this.router.navigate(['/user/home'], { replaceUrl: true });
            return false;
        }

        return true;
    }
}
