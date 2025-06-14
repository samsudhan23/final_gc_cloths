import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { AppLayout } from "../../layout/component/app.layout";
import { Dashboard } from "../../pages/dashboard/dashboard";
import { DashboardComponent } from "./components/dashboard/dashboard.component";

export const routes: Routes = [
    {
        path: '', component: AppLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'users',
                loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./components/product-management/product-management.component').then(m => m.ProductManagementComponent)
            },
            {
                path: 'category',
                loadComponent: () => import('./components/category/category.component').then(m => m.CategoryComponent)
            },
            {
                path: 'wishlist',
                loadComponent: () => import('./components/wishlist/wishlist.component').then(m => m.WishlistComponent)
            },
            {
                path: 'Cart',
                loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent)
            },
            {
                path: 'profile',
                loadComponent: () => import('../../pages/profile/profile.component').then(m => m.ProfileComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./components/setting/setting.component').then(m => m.SettingComponent)
            },
              {
                path: 'orders',
                loadComponent: () => import('./components/order-management/order-management.component').then(m => m.OrderManagementComponent)
            }
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }