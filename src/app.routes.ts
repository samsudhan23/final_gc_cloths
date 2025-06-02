import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { RoleGuard } from './app/shared/core/role.guard';
import { SignInComponent } from './app/pages/auth/sign-in/sign-in.component';
import { ResetpasswordComponent } from './app/pages/auth/resetpassword/resetpassword.component';
import { UserLayoutComponent } from './app/module/user_module/user-layout/user-layout.component';

export const appRoutes: Routes = [

    { path: '', redirectTo: 'user', pathMatch: 'full' },
    {
        path: 'admin',
        loadChildren: () => import('./app/module/admin_module/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }
    },
    {
        path: 'user',
        loadChildren: () => import('./app/module/user_module/user.module').then(m => m.UserModule),
        // canActivate: [RoleGuard],
        // data: { roles: ['user'] }
    },
    { path: 'notfound', component: Notfound },
    {
        path: 'login', component: SignInComponent
    },
    {
        path: 'reset-password/:token', component: ResetpasswordComponent
    },
    // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
