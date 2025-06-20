import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./home/home.component";
import { UserLayoutComponent } from "./user-layout/user-layout.component";

export const routes: Routes = [
    {
        path: '', component: UserLayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            {
                path: 'shop',
                loadComponent: () => import('./shop/shop.component').then(m => m.ShopComponent)
            },
        ]
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UerRoutingModule { }