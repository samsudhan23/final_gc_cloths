import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { RoleGuard } from './app/shared/core/role.guard';
import { SignInComponent } from './app/pages/auth/sign-in/sign-in.component';

export const appRoutes: Routes = [

    { path: '', component: Landing },
    {
        path: 'admin',
        // component: AppLayout,
        loadChildren: () => import('./app/module/admin_module/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { roles: ['admin'] }

        // children: [
        //     { path: '', component: Dashboard },
        //     { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
        //     { path: 'documentation', component: Documentation },
        //     { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        // ]
    },
    {
        path: 'user',
        loadChildren: () => import('./app/module/user_module/user.module').then(m => m.UserModule),
        canActivate: [RoleGuard],
        data: { roles: ['user'] }
    },
    { path: 'notfound', component: Notfound },
    {
        path: 'login', component: SignInComponent
    },
    // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
