import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { AuthenticationService } from "../../pages/service/authentication.service";

@Injectable({ providedIn: 'root' })

export class RoleGuard implements CanActivate {

    constructor(private auth: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (typeof window === 'undefined') {
            return false;
        }
        const roles = route.data['roles'] as string[];
        const user = this.auth.getCurrentUser();
        if (user && roles.includes(user.role)) {
            return true;
        }
        if (user?.role === 'admin') {
            this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
        } else if (user?.role === 'user') {
            this.router.navigate(['/user/home'], { replaceUrl: true });
        } else {
            this.router.navigate(['/login'], { replaceUrl: true });
        }
        return false;
    }

}
