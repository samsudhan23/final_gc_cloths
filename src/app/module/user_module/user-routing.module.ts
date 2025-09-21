import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { HomeComponent } from "./home/home.component";
import { LayoutComponent } from "./layout/layout.component";
import { ProductDetailsComponent } from "./product-details.component/product-details.component.component";
import { ContactusComponent } from "./contactus/contactus.component";
import { AboutComponent } from "./about/about.component";
// import { UserLayoutComponent } from "./user-layout/user-layout.component";

export const routes: Routes = [
    {
        // path: '', component: UserLayoutComponent,
        path: '', component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'product-details', component: ProductDetailsComponent },
            { path: 'contactus', component: ContactusComponent },
            { path: 'about', component: AboutComponent },
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