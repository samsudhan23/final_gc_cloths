import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AppLayout } from "../../layout/component/app.layout";
import { Dashboard } from "../../pages/dashboard/dashboard";

export const routes: Routes = [
    {
        path: '', component: AppLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            {
                path: 'users',
                loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./components/product-management/product-management.component').then(m => m.ProductManagementComponent)
            }
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }