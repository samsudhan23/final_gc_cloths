import { Routes } from '@angular/router';
import { Access } from './access';
import { Error } from './error';
import { SignInComponent } from './sign-in/sign-in.component';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: SignInComponent }
] as Routes;
