import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { RoleGuard } from './app/shared/core/role.guard';
import { SignInComponent } from './app/pages/auth/sign-in/sign-in.component';
import { ResetpasswordComponent } from './app/pages/auth/resetpassword/resetpassword.component';
import { HomeComponent } from './app/module/user_module/home/home.component';

export const appRoutes: Routes = [

    { path: '', component: HomeComponent },
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
    {
        path: 'reset-password/:token', component: ResetpasswordComponent
    },
    // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
